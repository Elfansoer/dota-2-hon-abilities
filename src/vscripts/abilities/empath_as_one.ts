import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier, ExtendedAbilityModifierMotionHorizontal } from "../lib/extended_modifier";

@registerAbility()
export class empath_as_one extends ExtendedAbility {
    Precache(context: CScriptPrecacheContext) {
        PrecacheResource( "soundfile", "soundevents/game_sounds_heroes/game_sounds_puck.vsndevts", context );
    }

    OnSpellStart() {
        this.InitSpellStart();
        const duration = this.V( "duration" );

        // purge self
        this.caster.Purge( true, true, false, false, false );
        
        // add modifiers
        const buff = modifier_empath_as_one_target.apply(
            this.targetUnit,
            this.caster,
            this,
            {}
        );

        // in case unit can't receive buff (dead, etc)
        if (!buff) return;

        modifier_empath_as_one_self.apply(
            this.caster,
            this.caster,
            this,
            {duration}
        )?.Init( buff );
    }
}

@registerModifier()
export class modifier_empath_as_one_target extends ExtendedAbilityModifier {
    attackSpeed = this.V( "bonus_speed" );
    attackDamage = this.V( "bonus_damage" );

    IsPurgable(): boolean {
        return false;
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
            ModifierFunction.BASEATTACK_BONUSDAMAGE,
        ]
    }

    GetModifierAttackSpeedBonus_Constant() {
        return this.attackSpeed;
    }

    GetModifierBaseAttack_BonusDamage() {
        return this.attackDamage
    }
}

@registerModifier()
export class modifier_empath_as_one_scepter extends ExtendedAbilityModifier {
    IsPurgable(): boolean {
        return false;
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.IS_SCEPTER,
        ]
    }

    GetModifierScepter(): 0 | 1 {
        return 1;
    }
}

@registerModifier()
export class modifier_empath_as_one_self extends ExtendedAbilityModifierMotionHorizontal {
    manaRegen = this.V( "mana_regen" );
    distance = -this.V( "follow_distance" );
    target?: CDOTA_BaseNPC;
    targetModifier?: modifier_empath_as_one_target;

    Init( modifier: modifier_empath_as_one_target ) {
        this.target = modifier.GetParent();
        this.targetModifier = modifier;
        if (!this.ApplyHorizontalMotionController()) {
            this.Destroy();
        }
    }

    OnDestroy() {
        if (!IsServer()) return;
        this.parent.RemoveHorizontalMotionController( this );

        function DestroyModifier( modifier: CDOTA_Buff | undefined ) {
            if (modifier && !ExtendedAbilityModifier.IsNull( modifier )) {
                modifier.Destroy();
            }
        }

        // destroy benefit modifiers
        DestroyModifier( this.targetModifier );
        DestroyModifier( modifier_empath_as_one_scepter.find( this.target ) );
    }

    UpdateHorizontalMotion(me: CDOTA_BaseNPC, dt: number): void {
        if (!this.target) return;

        // check target is alive
        if (!this.target.IsAlive()) {
            this.Destroy();
        }

        // update scepter status
        const giveScepter = this.V( "give_scepter" )==1;
        const giveScepterModifier = modifier_empath_as_one_scepter.find( this.target );
        if (giveScepter && !giveScepterModifier) {
            modifier_empath_as_one_scepter.apply(
                this.target,
                this.caster,
                this.ability,
                {}
            )
        } else if ( !giveScepter && giveScepterModifier ) {
            giveScepterModifier.Destroy();
        }

        // update position
        me.SetOrigin( this.target.GetOrigin() + this.target.GetForwardVector() * this.distance as Vector );
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.DISARMED]: true,
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.MANA_REGEN_CONSTANT,
            ModifierFunction.IGNORE_CAST_ANGLE,
        ]
    }

    GetModifierConstantManaRegen() {
        return this.manaRegen;
    }

    GetModifierIgnoreCastAngle(): 0 | 1 {
        return 1
    }
}