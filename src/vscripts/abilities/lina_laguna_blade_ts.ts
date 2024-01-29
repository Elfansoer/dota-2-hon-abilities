import { registerAbility } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ParticleEffect } from "../lib/particle_effects";

@registerAbility()
export class lina_laguna_blade_ts extends ExtendedAbility {
    Precache(context: CScriptPrecacheContext) {
        PrecacheResource( "soundfile", "soundevents/game_sounds_heroes/game_sounds_lina.vsndevts", context );
    }

    GetAbilityTargetFlags() {
        return this.V("pierce_immune")==1 ? UnitTargetFlags.MAGIC_IMMUNE_ENEMIES : UnitTargetFlags.NONE;
    }

    GetAbilityDamageType() {
        return this.V("pure_damage")==1 ? DamageTypes.PURE : DamageTypes.MAGICAL;
    }
    
    OnSpellStart(): void {
        this.InitSpellStart();
        const delay = this.V("damage_delay");
        const damage = this.V("damage");

        if (this.targetUnit.TriggerSpellAbsorb(this)) return;

        Timers.CreateTimer(delay,()=>{
            if (this.targetUnit.IsInvulnerable()) return;

            ApplyDamage({
                victim: this.targetUnit,
                attacker: this.caster,
                damage: damage,
                damage_type: this.GetAbilityDamageType(),
                ability: this,
            });
        });

        ParticleEffect.LinaLagunaBlade( this.caster, this.targetUnit );
        EmitSoundOn( "Ability.LagunaBladeImpact", this.targetUnit );
    }
}