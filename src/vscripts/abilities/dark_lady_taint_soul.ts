import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class dark_lady_taint_soul extends ExtendedAbility {
    OnSpellStart(): void {
        this.InitSpellStart();
        const duration = this.V("duration");
        const damage = this.V("damage");

        ApplyDamage({
            victim: this.targetUnit,
            attacker: this.caster,
            damage: damage,
            damage_type: this.GetAbilityDamageType(),
            ability: this
        });

        modifier_dark_lady_taint_soul.apply(
            this.caster,
            this.caster,
            this,
            {duration}
        )
    }
}

@registerModifier()
export class modifier_dark_lady_taint_soul extends ExtendedAbilityModifier {
    moveSlow = -this.V("slow");

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
        ]
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return this.moveSlow * (this.GetRemainingTime()/this.GetDuration());
    }
}