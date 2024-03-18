import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";
import { ParticleEffect } from "../lib/particle_effects";

@registerAbility()
export class ellonia_flash_freeze extends ExtendedAbility {
    Precache(context: CScriptPrecacheContext) {
        PrecacheResource( "soundfile", "soundevents/game_sounds_heroes/game_sounds_crystalmaiden.vsndevts", context );
    }

    OnSpellStart(): void {
        const targetUnit = this.GetCursorTarget();
        if (!targetUnit || targetUnit.TriggerSpellAbsorb( this )) return;

        const frosted_damage = this.V( "frosted_damage" );
        const max_damage = this.V( "max_damage" );
        const max_stun = this.V( "max_stun" );
        const frosted_stun = this.V( "frosted_stun" );
        
        let damage = this.V( "damage" );
        let stun = this.V( "stun" );

        const modifier = modifier_ellonia_common_frosted.find( targetUnit );
        if (modifier) {
            damage = math.min( max_damage, damage + frosted_damage * modifier.GetStackCount() );
            stun = math.min( max_stun, stun + frosted_stun * modifier.GetStackCount() );
            modifier.Destroy();
        }

        // damage
        ApplyDamage({
            victim: targetUnit,
            attacker: this.caster,
            damage: damage,
            damage_type: this.GetAbilityDamageType(),
            ability: this,
        });

        // stun
        const stunModifier = targetUnit.AddNewModifier(
            this.caster,
            this,
            "modifier_stunned",
            {duration: stun}
        );

        ParticleEffect.CrystalMaidenFrostBite({target: targetUnit}).attach(stunModifier);
    }
}

@registerModifier()
export class modifier_ellonia_common_frosted extends ExtendedAbilityModifier {
    GetTexture(): string {
        return ellonia_flash_freeze.name;
    }

    OnCreated(params: {count: number}) {
        if (!IsServer()) return;
        this.SetStackCount( this.GetStackCount() + params.count );
    }
    OnRefresh(params: {count: number}) {
        this.OnCreated(params);
    }
}