import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";
import { modifier_empath_as_one_self } from "./empath_as_one";

@registerAbility()
export class empath_essence_link extends ExtendedAbility {
    Precache(context: CScriptPrecacheContext) {
        PrecacheResource( "soundfile", "soundevents/game_sounds_heroes/game_sounds_puck.vsndevts", context );
    }

    OnSpellStart(): void {
        this.InitSpellStart();
        const duration = this.V( "duration" );
        modifier_empath_essence_link.apply(
            this.targetUnit,
            this.caster,
            this,
            {duration}
        );
    }
}

@registerModifier()
export class modifier_empath_essence_link extends ExtendedAbilityModifier {
    interval = this.V( "interval" );
    damageHeal = this.V( "damage_heal" );
    breakStun = this.V( "stun" );
    range = this.V( "link_bonus_distance" ) + this.ability.GetCastRange( this.parent.GetAbsOrigin(), undefined );

    OnCreated() {
        if (!IsServer()) return;
        this.StartIntervalThink( this.interval );
    }

    OnRefresh(): void {
        this.interval = this.V( "interval" );
        this.damageHeal = this.V( "damage_heal" );
        this.breakStun = this.V( "stun" );
        this.range = this.V( "link_bonus_distance" ) + this.ability.GetCastRange( this.parent.GetAbsOrigin(), undefined );            
    }

    OnIntervalThink(): void {
        const damageValue = this.damageHeal * this.interval;

        // damage
        ApplyDamage({
            victim: this.parent,
            attacker: this.caster,
            damage: damageValue,
            damage_type: this.damageType,
            ability: this.ability
        });

        // heal
        const modifierAsOne = modifier_empath_as_one_self.find(this.caster);
        const healTarget = modifierAsOne?.target || this.caster;

        healTarget.HealWithParams(
            damageValue,
            this.ability,
            false,
            true,
            this.caster,
            false
        );

        // overhead info
        SendOverheadEventMessage(
            undefined,
            OverheadAlert.HEAL,
            healTarget,
            damageValue,
            this.caster.GetPlayerOwner()
        );

        // break stun
        if ( (this.caster.GetOrigin() - this.parent.GetOrigin() as Vector).Length2D() > this.range ) {
            this.parent.AddNewModifier(
                this.caster,
                this.ability,
                "modifier_stunned",
                {duration: this.breakStun}
            );
        }
    }
}