import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class rhapsody_arcane_hymn extends ExtendedAbility {
    GetIntrinsicModifierName() {
        return modifier_rhapsody_arcane_hymn_aura.name;
    }
}

@registerModifier()
export class modifier_rhapsody_arcane_hymn_aura extends ExtendedAbilityModifier {
    IsAura() {
        return true;
    }

    GetModifierAura(): string {
        return modifier_rhapsody_arcane_hymn.name;
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

export class modifier_rhapsody_arcane_hymn extends ExtendedAbilityModifier {
    spellAmp = this.V("spell_amp");
    healAmp = this.V("heal_amp");
    debuffAmp =this.V("debuff_amp");

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.SPELL_AMPLIFY_PERCENTAGE,
            ModifierFunction.HEAL_AMPLIFY_PERCENTAGE_SOURCE,
            ModifierFunction.STATUS_RESISTANCE_CASTER,
        ]
    }

    GetModifierSpellAmplify_Percentage() {
        return this.spellAmp;
    }

    GetModifierHealthRegenPercentage() {
        return this.healAmp;
    }

    GetModifierStatusResistanceCaster() {
        return this.debuffAmp;
    }
}