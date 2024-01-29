import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class artesia_arcane_bolt extends ExtendedAbility {
    GetIntrinsicModifierName(): string {
        return modifier_artesia_arcane_bolt_intrinsic.name;
    }

    OnToggle(): void {
        this.InitSpellStart();
        const toggleModifier = modifier_artesia_arcane_bolt_heal_mode.find( this.caster );
        if (this.GetToggleState()) {
            modifier_artesia_arcane_bolt_heal_mode.apply(
                this.caster,
                this.caster,
                this,
                {}
            )
        } else {
            toggleModifier?.Destroy();
        }
    }
}

@registerModifier()
export class modifier_artesia_arcane_bolt_heal_mode extends ExtendedAbilityModifier {
    IsHidden(): boolean {
        return true;
    }

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.PERMANENT;
    }
}

@registerModifier()
export class modifier_artesia_arcane_bolt_intrinsic extends ExtendedAbilityModifier {
    bolts = this.V( "bolts" );

    IsHidden(): boolean {
        return true;
    }

    OnRefresh(params: object): void {
        this.bolts = this.V( "bolts" );   
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ON_ABILITY_FULLY_CAST,
        ]
    }

    OnAbilityFullyCast(event: ModifierAbilityEvent): void {
        if (event.ability==this.ability || event.ability.IsItem()) return;

        modifier_artesia_arcane_bolt_shots.apply(
            this.parent,
            this.parent,
            this.ability,
            { bolts: this.bolts }
        );
    }
}

@registerModifier()
export class modifier_artesia_arcane_bolt_shots extends ExtendedAbilityModifier {
    interval = this.V( "interval" );
    radius = this.V( "radius" );
    speed = this.V( "speed" );
    damage = this.V( "damage" );
    heal = this.V( "heal" );

    OnCreated(params: {bolts: number}): void {
        if (!IsServer()) return;
        this.SetStackCount( params.bolts );
        this.StartIntervalThink( this.interval );
        this.OnIntervalThink();
    }

    OnRefresh(params: {bolts: number} ): void {
        if (!IsServer()) return;
        this.SetStackCount( this.GetStackCount() + params.bolts );

        this.interval = this.V( "interval" );
        this.radius = this.V( "radius" );
        this.speed = this.V( "speed" );
        this.damage = this.V( "damage" );    
        this.heal = this.V( "heal" );
    }

    OnIntervalThink(): void {
        // check mode
        // TODO: check if healmode is multi-instanceability
        const healMode = modifier_artesia_arcane_bolt_heal_mode.find( this.parent );

        // find random target
        const targets = FindUnitsInRadius(
            this.teamNumber,
            this.parent.GetOrigin(),
            undefined,
            this.radius,
            healMode ? UnitTargetTeam.FRIENDLY : UnitTargetTeam.ENEMY,
            this.targetType,
            this.targetFlags,
            FindOrder.ANY,
            false
        );
        const target = healMode
            ? targets.filter(unit=>unit!=this.parent).shift()
            : targets.shift();

        // shot projectile
        if (target) {
            this.ability.CreateTrackingProjectile({
                populateDefaultValues: true,
                Target: target,
                iMoveSpeed: this.speed,
                OnProjectileHit: (unit)=>{
                    if (healMode) {
                        unit.HealWithParams( this.heal, this.ability, false, true, this.parent, false );
                    } else {
                        ApplyDamage({
                            victim: unit,
                            attacker: this.parent,
                            damage: this.damage,
                            damage_type: this.damageType,
                            ability: this.ability,
                        });
                    }
                }
            });
        }

        // remove stack
        this.DecrementStackCount();
        if (this.GetStackCount()<=0) {
            this.Destroy();
            return;
        }

        // in case interval speed changes
        this.StartIntervalThink( this.interval );
    }
}