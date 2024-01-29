import { registerAbility } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";

@registerAbility()
export class riftwalker_rift_burn extends ExtendedAbility {
    OnSpellStart(): void {
        this.InitSpellStart();
        const interval = this.V("interval");
        const pulses = this.V("pulses");
        const pulseMultiplier = this.V("pulse_multiplier");
        const initRadius = this.V("initial_radius");
        const pulseRadius = this.V("pulse_radius");
        const initDamage = this.V("initial_damage");
        const totalPulseDamage = this.V("total_pulse_damage");
        
        const DoAreaDamage = (radius: number, damage: number)=>{
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

            }
        }

        // init damage
        DoAreaDamage(initRadius,initDamage);

        // calculate pulse damage
        const divisor = [...Array(pulses-1).keys()]
            .map(n=>pulseMultiplier^n)
            .reduce((sum,current)=>sum+current);
        const initialPulseDamage = totalPulseDamage/divisor;
        const pulseDamages = [...Array(pulses-1).keys()]
            .map(n=>initialPulseDamage * pulseMultiplier^n);

        // TODO check multiinstance
        let currentPulse = 0;
        Timers.CreateTimer(interval,()=>{
            DoAreaDamage(pulseRadius,pulseDamages[currentPulse]);
            if (currentPulse++<pulses) return interval;
        });
    }
}