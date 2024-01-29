import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";
import { modifier_ellonia_common_frosted } from "./ellonia_absolute_zero";

@registerAbility()
export class ellonia_frigid_field extends ExtendedAbility {
    Precache(context: CScriptPrecacheContext) {
        PrecacheResource( "soundfile", "soundevents/game_sounds_heroes/game_sounds_crystalmaiden.vsndevts", context );
    }

    GetAOERadius(): number {
        return this.V("radius");
    }

    OnSpellStart(): void {
        this.InitSpellStart();
        const duration = this.V( "duration" );

        CreateModifierThinker(
            this.caster,
            this,
            "modifier_ellonia_frigid_field",
            {duration: duration},
            this.targetPoint,
            this.teamNumber,
            false
        );
    }
}

@registerModifier()
export class modifier_ellonia_frigid_field extends ExtendedAbilityModifier {
    radius = this.V( "radius" );
    damage = this.V( "damage" );
    count = this.V( "frosted_count" );
    duration = this.V( "frosted_duration" );

    OnCreated() {
        const vision = 300;
        const interval = 1;

        if (!IsServer()) return;
        
        AddFOWViewer( this.teamNumber, this.parent.GetOrigin(), vision, this.GetDuration(), false );

        this.StartIntervalThink(interval);
        this.OnIntervalThink();
    }

    OnIntervalThink() {
        const enemies = FindUnitsInRadius(
            this.teamNumber,
            this.parent.GetOrigin(),
            undefined,
            this.radius,
            this.targetTeam,
            this.targetType,
            this.targetFlags,
            FindOrder.ANY,
            false
        )

        for (const enemy of enemies) {
            // damage
            ApplyDamage({
                victim: enemy,
                attacker: this.caster,
                damage: this.damage,
                damage_type: this.damageType,
                ability: this.ability,
            });

            // frost charges
            modifier_ellonia_common_frosted.apply(
                enemy,
                this.caster,
                this.ability,
                {
                    duration: this.duration,
                    count: this.count
                }
            );
        }
    }
}