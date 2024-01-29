import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class ellonia_flash_freeze extends ExtendedAbility {
    Precache(context: CScriptPrecacheContext) {
        PrecacheResource( "soundfile", "soundevents/game_sounds_heroes/game_sounds_crystalmaiden.vsndevts", context );
    }

    OnSpellStart(): void {
        this.InitSpellStart();
        const frosted_damage = this.V( "frosted_damage" );
        const max_damage = this.V( "max_damage" );
        const max_stun = this.V( "max_stun" );
        const frosted_stun = this.V( "frosted_stun" );
        
        let damage = this.V( "damage" );
        let stun = this.V( "stun" );

        if (this.targetUnit.TriggerSpellAbsorb( this )) return;

        const modifier = modifier_ellonia_common_frosted.find( this.targetUnit );
        if (modifier) {
            damage = math.min( max_damage, damage + frosted_damage * modifier.GetStackCount() );
            stun = math.min( max_stun, stun + frosted_stun * modifier.GetStackCount() );
            modifier.Destroy();
        }

        // damage
        ApplyDamage({
            victim: this.targetUnit,
            attacker: this.caster,
            damage: damage,
            damage_type: this.GetAbilityDamageType(),
            ability: this,
        });

        // stun
        this.targetUnit.AddNewModifier(
            this.caster,
            this,
            "modifier_stunned",
            {duration: stun}
        );
    }
}

@registerModifier()
export class modifier_ellonia_common_frosted extends ExtendedAbilityModifier {
    OnCreated(params: {count: number}) {
        if (!IsServer()) return;
        this.SetStackCount( this.GetStackCount() + params.count );
    }
    OnRefresh(params: {count: number}) {
        this.OnCreated(params);
    }
}