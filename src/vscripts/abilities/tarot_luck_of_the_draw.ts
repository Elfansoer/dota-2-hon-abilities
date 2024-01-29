import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class tarot_luck_of_the_draw extends ExtendedAbility {
    GetIntrinsicModifierName() {
        return modifier_tarot_luck_of_the_draw_passive.name;
    }
}

@registerModifier()
export class modifier_tarot_luck_of_the_draw_passive extends ExtendedAbilityModifier {
    critMult = this.V("crit_multiplier");
    critChance = this.V("chance");

    IsHidden(): boolean {
        return true
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.PREATTACK_CRITICALSTRIKE,
        ]
    }

    GetModifierPreAttack_CriticalStrike(event: ModifierAttackEvent): number {
        return RollPseudoRandomPercentage(this.critChance,this.ability.entindex(),this.parent)
            ? this.critMult
            : 0
    }
}