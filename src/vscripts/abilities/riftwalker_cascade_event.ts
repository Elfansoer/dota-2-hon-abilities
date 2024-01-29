import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class riftwalker_cascade_event extends ExtendedAbility {
    OnSpellStart(): void {
        this.InitSpellStart();
        const delay = this.V("delay");
        const damage = this.V("damage");
        const radius = this.V("radius");
        const pullDuration = this.V("pull_duration")
        
        // TODO check multiinstance
        Timers.CreateTimer(delay,()=>{
            const enemies = FindUnitsInRadius(
                this.teamNumber,
                this.targetPoint,
                undefined,
                radius,
                this.GetAbilityTargetTeam(),
                this.GetAbilityTargetType(),
                this.GetAbilityTargetFlags(),
                FindOrder.ANY,
                false
            );

            for (const enemy of enemies) {
                ApplyDamage({
                    victim: enemy,
                    attacker: this.caster,
                    damage: damage,
                    damage_type: this.GetAbilityDamageType(),
                    ability: this,
                });

                enemy.AddNewModifier(
                    this.caster,
                    this,
                    "modifier_knockback",
                    {
                        center_x: this.targetPoint.x,
                        center_y: this.targetPoint.y,
                        center_z: this.targetPoint.z,
                        duration: pullDuration,
                        knockback_duration: pullDuration,
                        knockback_distance: -(enemy.GetOrigin()-this.targetPoint as Vector).Length2D(),
                        knockback_height: 0,
                        should_stun: 1,
                    }
                )
            }
        })
    }
}