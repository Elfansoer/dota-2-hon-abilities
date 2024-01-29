import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class dark_lady_dark_blades extends ExtendedAbility {
    OnSpellStart(): void {
        this.InitSpellStart();
        const duration = this.V("duration");
        modifier_dark_lady_dark_blades.apply(
            this.caster,
            this.caster,
            this,
            {duration}
        )
    }
}

@registerModifier()
export class modifier_dark_lady_dark_blades extends ExtendedAbilityModifier {
    baseDamage = this.V("base_damage");
    silence = this.V("silence");

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.BASEATTACK_BONUSDAMAGE,
            ModifierFunction.PROCATTACK_FEEDBACK,
        ]
    }

    GetModifierBaseAttack_BonusDamage(): number {
        return this.baseDamage;
    }

    GetModifierProcAttack_Feedback(event: ModifierAttackEvent) {
        event.target.AddNewModifier(
            this.parent,
            this.ability,
            "modifier_silence",
            {duration: this.silence}
        )
        return 1
    }
}