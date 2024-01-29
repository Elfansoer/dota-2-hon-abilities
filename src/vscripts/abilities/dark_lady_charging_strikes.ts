import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class dark_lady_charging_strikes extends ExtendedAbility {
    OnSpellStart(): void {
        this.InitSpellStart();
        const duration = this.V("duration");
        const radius = this.V("radius");

        const startPoint = this.caster.GetOrigin();
        const endPoint = this.targetPoint;

        const enemies = FindUnitsInLine(
            this.teamNumber,
            startPoint,
            endPoint,
            undefined,
            radius,
            this.GetAbilityTargetTeam(),
            this.GetAbilityTargetType(),
            this.GetAbilityTargetFlags()
        );

        const modifier = modifier_dark_lady_charging_strikes.apply(
            this.caster,
            this.caster,
            this,
            {duration}
        );

        for (const enemy of enemies) {
            modifier?.IncrementStackCount();
            this.caster.PerformAttack(enemy,false,true,true,true,false,false,false);
        }
        
        modifier?.Destroy();

        modifier_dark_lady_charging_strikes_zeal.apply(
            this.caster,
            this.caster,
            this,
            {duration}
        )
    }
}

@registerModifier()
export class modifier_dark_lady_charging_strikes extends ExtendedAbilityModifier {
    multiplier = this.V("attack_multiplier");

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.DAMAGEOUTGOING_PERCENTAGE,
        ]
    }

    GetModifierDamageOutgoing_Percentage(): number {
        return Math.pow( (100+this.multiplier)/100, this.GetStackCount() )*100 - 100;
    }
}

@registerModifier()
export class modifier_dark_lady_charging_strikes_zeal extends ExtendedAbilityModifier {
    attackSpeed = this.V("attack_speed");

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
        ]
    }

    GetModifierAttackSpeedBonus_Constant(): number {
        return this.attackSpeed
    }
}