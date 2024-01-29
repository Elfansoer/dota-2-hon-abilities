import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";
import { modifier_artesia_arcane_bolt_heal_mode } from "./artesia_arcane_bolt";

@registerAbility()
export class artesia_arcane_missile extends ExtendedAbility {
    OnSpellStart(): void {
        this.InitSpellStart();
        const damage = this.V( "damage" );
        const heal = this.V( "heal" );
        const speed = this.V( "speed" );
        const searchRadius = this.V( "search_radius" );
        const hitRadius = this.V( "hit_radius" );
        const strikeRadius = this.V( "strike_radius" );
        const expireTime = this.V( "expire_time" );
        const slowDuration = this.V( "slow_duration" );
        const shouldPierce = this.V( "should_pierce" );

        const dummyTarget = CreateModifierThinker(
            this.caster,
            this,
            "",
            {},
            this.targetPoint,
            this.teamNumber,
            false
        )

        // TODO: check if healmode/target is multi-instanceability
        const healMode = this.caster.HasModifier( modifier_artesia_arcane_bolt_heal_mode.name );
        let target: CDOTA_BaseNPC | undefined = undefined;
        const hitTargets: CDOTA_BaseNPC[] = [];
        this.CreateTrackingProjectile({
            populateDefaultValues: true,
            Target: dummyTarget,
            iMoveSpeed: speed,
            flExpireTime: expireTime,

            OnProjectileThink: (location)=>{
                // find closest hero if not found yet
                // track its location otherwise
                target ??= FindUnitsInRadius(
                    this.teamNumber,
                    location,
                    undefined,
                    searchRadius,
                    healMode ? UnitTargetTeam.FRIENDLY : UnitTargetTeam.ENEMY,
                    UnitTargetType.HERO,
                    this.GetAbilityTargetFlags(),
                    FindOrder.CLOSEST,
                    false
                ).shift();
                if (target) {
                    dummyTarget.SetOrigin( target.GetOrigin() );
                }

                const HitUnit = (unit: CDOTA_BaseNPC)=>{
                    // damage / heal collided units with scepter
                    if (healMode) {
                        unit.HealWithParams( heal, this, false, true, this.caster, false );
                    } else {
                        ApplyDamage({
                            victim: unit,
                            attacker: this.caster,
                            damage: damage,
                            damage_type: this.GetAbilityDamageType(),
                            ability: this,
                        });
        
                        modifier_artesia_arcane_missile.apply(
                            unit,
                            this.caster,
                            this,
                            {duration: slowDuration}
                        );        
                    }
        
                    hitTargets.push(unit);
                }

                // find units collided with projectiles
                // but exclude units already hit (from scepter)
                const collidedUnit = FindUnitsInRadius(
                    this.teamNumber,
                    location,
                    undefined,
                    hitRadius,
                    healMode ? UnitTargetTeam.FRIENDLY : UnitTargetTeam.ENEMY,
                    UnitTargetType.HERO + UnitTargetType.BASIC,
                    this.GetAbilityTargetFlags(),
                    FindOrder.CLOSEST,
                    false
                )
                .filter( unit => !hitTargets.includes(unit) && unit!=this.caster )
                .shift();
                if (!collidedUnit) return 0;

                // without scepter or hits a hero explode
                // with scepter and not hero, just hit
                if (collidedUnit.IsHero() || !shouldPierce) {
                    // explode within radius
                    const explosionUnits = FindUnitsInRadius(
                        this.teamNumber,
                        collidedUnit.GetOrigin(),
                        undefined,
                        strikeRadius,
                        healMode ? UnitTargetTeam.FRIENDLY : UnitTargetTeam.ENEMY,
                        UnitTargetType.HERO + UnitTargetType.BASIC,
                        this.GetAbilityTargetFlags(),
                        FindOrder.ANY,
                        false
                    )
                    .filter(unit=>!hitTargets.includes(unit));

                    for (const unit of explosionUnits) {
                        HitUnit(unit);
                    }
                    
                    return -1;
                } else {
                    // pierce
                    HitUnit(collidedUnit);
                    return 0;
                }
            },
        });
    }
}

@registerModifier()
export class modifier_artesia_arcane_missile extends ExtendedAbilityModifier<artesia_arcane_missile> {
    slow = -this.V( "slow" );

    IsDebuff(): boolean {
        return true;
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
        ]
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return this.slow;
    }
}