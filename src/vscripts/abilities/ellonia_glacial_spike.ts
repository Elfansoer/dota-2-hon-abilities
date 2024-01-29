import { registerAbility } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { modifier_ellonia_common_frosted } from "./ellonia_absolute_zero";

@registerAbility()
export class ellonia_glacial_spike extends ExtendedAbility {
    Precache(context: CScriptPrecacheContext) {
        PrecacheResource( "soundfile", "soundevents/game_sounds_heroes/game_sounds_crystalmaiden.vsndevts", context );
    }

    OnSpellStart(): void {
        this.InitSpellStart();
        const range = this.GetCastRange(this.targetPoint,undefined);
        const speed = this.V( "speed" );
        const damage = this.V( "damage" );
        const radius = this.V( "radius" );
        const count = this.V( "frosted_count" );
        const duration = this.V( "frosted_duration" );
        const hitVision = 500;
        const hitVisionDuration = 2;

        this.CreateLinearProjectile({
            populateDefaultValues: true,
            EffectName: "particles/units/heroes/hero_lina/lina_spell_dragon_slave.vpcf",
            SoundName: "Hero_Lina.DragonSlave",

            fDistance: range,
            fRadius: radius,
            fSpeed: speed,

            bProvidesVision: true,
            iVisionRadius: radius,
            iVisionTeamNumber: this.teamNumber,

            OnProjectileHit: (target, _location)=>{
                // damage
                ApplyDamage({
                    attacker: this.caster,
                    ability: this,
                    damage: damage,
                    damage_type: this.GetAbilityDamageType(),
                    victim: target,
                });

                // frost charges
                modifier_ellonia_common_frosted.apply(
                    target,
                    this.caster,
                    this,
                    {duration,count}
                );

                // vision
                AddFOWViewer( this.teamNumber, target.GetOrigin(), hitVision, hitVisionDuration, false );
            },
        });
    }
}