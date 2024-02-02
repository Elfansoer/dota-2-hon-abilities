import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class empath_synergy extends ExtendedAbility {
    GetIntrinsicModifierName() {
        return modifier_empath_synergy_aura.name;
    }
}

@registerModifier()
export class modifier_empath_synergy_aura extends ExtendedAbilityModifier {
    IsAura() {
        return true;
    }

    GetModifierAura(): string {
        return modifier_empath_synergy.name;
    }

    GetAuraRadius() {
        return -1;
    }

    GetAuraSearchTeam() {
        return this.targetTeam;
    }

    GetAuraSearchType() {
        return this.targetType;
    }

    GetAuraSearchFlags() {
        return this.targetFlags;
    }
}

export class modifier_empath_synergy extends ExtendedAbilityModifier {
    baseRegen = this.V( "base_regen" );
    pctRegen = this.V( "pct_regen" );

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.HEALTH_REGEN_CONSTANT,
            ModifierFunction.HEALTH_REGEN_PERCENTAGE,
        ]
    }

    GetModifierConstantHealthRegen() {
        return this.baseRegen;
    }

    GetModifierHealthRegenPercentage() {
        return this.pctRegen
    }
}