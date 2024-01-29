import { registerAbility } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";

const AbilityValues = ["haha","hoho"] as const;

@registerAbility()
export class lina_dragon_slave_ts extends ExtendedAbility {
    Precache(context: CScriptPrecacheContext) {
        PrecacheResource( "soundfile", "soundevents/game_sounds_heroes/game_sounds_lina.vsndevts", context );
    }

    OnSpellStart(): void {
        this.InitSpellStart();
        const range = this.GetSpecialValueFor( "dragon_slave_distance" );
        const speed = this.GetSpecialValueFor( "dragon_slave_speed" );
        const damage = this.GetSpecialValueFor( "dragon_slave_damage" );
        const startRadius = this.GetSpecialValueFor( "dragon_slave_width_initial" );
        const endRadius = this.GetSpecialValueFor( "dragon_slave_width_end" );

        this.CreateLinearProjectile({
            populateDefaultValues: true,
            EffectName: "particles/units/heroes/hero_lina/lina_spell_dragon_slave.vpcf",
            SoundName: "Hero_Lina.DragonSlave",

            fDistance: range,
            fStartRadius: startRadius,
            fEndRadius: endRadius,
            fSpeed: speed,

            OnProjectileHit: (target, _location)=>{
                ApplyDamage({
                    attacker: this.caster,
                    ability: this,
                    damage: damage,
                    damage_type: this.GetAbilityDamageType(),
                    victim: target,
                });
            },
        });

        EmitSoundOn("Hero_Lina.DragonSlave.Cast",this.caster);
    }
}