import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class riftwalker_shared_existence extends ExtendedAbility {
    OnSpellStart(): void {
        this.InitSpellStart();
        const duration = this.V("duration");

        if (this.targetUnit.TriggerSpellAbsorb(this)) return;

        modifier_riftwalker_shared_existence.apply(
            this.targetUnit,
            this.caster,
            this,
            {duration}
        );
   }
}

@registerModifier()
export class modifier_riftwalker_shared_existence extends ExtendedAbilityModifier {
    baseValue = -this.V("base_slow");
    stackValue = -this.V("stack_slow");
    maxStack = this.V("max_stack");
    triggerDamage = this.V("trigger_damage");

    IsDebuff(): boolean {
        return true;
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
            ModifierFunction.ON_TAKEDAMAGE,
        ]
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return this.baseValue + this.stackValue * this.GetStackCount();
    }

    OnTakeDamage(event: ModifierInstanceEvent): void {
        if (event.unit!=this.parent) return;
        if (event.damage<this.triggerDamage) return;
        if (this.GetStackCount()<this.maxStack) this.IncrementStackCount();
    }
}