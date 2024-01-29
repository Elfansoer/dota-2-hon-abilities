import { registerAbility } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ParticleEffect } from "../lib/particle_effects";

@registerAbility()
export class lina_light_strike_array_ts extends ExtendedAbility {
    Precache(context: CScriptPrecacheContext) {
        PrecacheResource( "soundfile", "soundevents/game_sounds_heroes/game_sounds_lina.vsndevts", context );
    }
    
    GetAOERadius() {
        return this.V("light_strike_array_aoe");
    }

    OnSpellStart(): void {
        this.InitSpellStart()
        const radius = this.V("light_strike_array_aoe");
        const damage = this.V("light_strike_array_damage");
        const delay = this.V("light_strike_array_delay_time");

        Timers.CreateTimer(delay,()=>{
            GridNav.DestroyTreesAroundPoint( this.targetPoint, radius, true );

            const enemies = FindUnitsInRadius(
                this.caster.GetTeamNumber(),
                this.targetPoint,
                undefined,
                radius,
                this.GetAbilityTargetTeam(),
                this.GetAbilityTargetType(),
                this.GetAbilityTargetFlags(),
                FindOrder.ANY,
                false
            )

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
                    "modifier_stunned",
                    {duration: this.V("light_strike_array_stun_duration")}
                );
            }

            ParticleEffect.LinaLightStrikeArray( this.targetPoint, this.V("light_strike_array_aoe") );
            EmitSoundOnLocationWithCaster( this.targetPoint, "Ability.LightStrikeArray", this.caster );
        });

        ParticleEffect.LinaLightStrikeArrayInit( this.caster, this.targetPoint, this.V("light_strike_array_aoe") );
        EmitSoundOnLocationForAllies( this.targetPoint, "Ability.PreLightStrikeArray", this.caster );
    }
}