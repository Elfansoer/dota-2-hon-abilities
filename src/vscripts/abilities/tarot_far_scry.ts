import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

/*
NOTES:
Armor penetration replaced by flat armor reduction
*/

@registerAbility()
export class tarot_far_scry extends ExtendedAbility {
    GetIntrinsicModifierName() {
        return modifier_tarot_far_scry_passive.name;
    }

    OnSpellStart(): void {
        this.InitSpellStart();
        const duration = this.V("duration");

        modifier_tarot_far_scry.apply(
            this.targetUnit,
            this.caster,
            this,
            {duration}
        );
    }
}

@registerModifier()
export class modifier_tarot_far_scry_passive extends ExtendedAbilityModifier {
    range = this.V("range");

    IsHidden(): boolean {
        return true
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.PROCATTACK_FEEDBACK,
        ]
    }

    GetModifierProcAttack_Feedback(event: ModifierAttackEvent): number {
        if (event.target.HasModifier(modifier_tarot_far_scry.name)) return 1;

        const markedEnemies = FindUnitsInRadius(
            this.teamNumber,
            event.target.GetOrigin(),
            undefined,
            this.range,
            this.targetTeam,
            this.targetType,
            this.targetFlags,
            FindOrder.ANY,
            false
        ).filter(unit=>unit.HasModifier(modifier_tarot_far_scry.name));

        if (markedEnemies.length==0) return 1;
        
        // temporarily move parent to target position, attacks, then return to original position
        const origin = this.parent.GetOrigin();
        this.parent.SetOrigin( event.target.GetOrigin() );
        for (const enemy of markedEnemies) {
            this.parent.PerformAttack(enemy,false,true,false,false,true,false,false);
        }
        this.parent.SetOrigin(origin);

        return 1
    }
}

@registerModifier()
export class modifier_tarot_far_scry extends ExtendedAbilityModifier {
    armor = -this.V("armor_reduction");

    OnCreated(params: object): void {
        if (!IsServer()) return;
        this.parent.AddNewModifier(
            this.caster,
            this.ability,
            "modifier_truesight",
            {duration: this.GetDuration()}
        )
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.PHYSICAL_ARMOR_BONUS,
            ModifierFunction.PROVIDES_FOW_POSITION,
        ]
    }

    GetModifierProvidesFOWVision(): 0 | 1 {
        return 1
    }

    GetModifierPhysicalArmorBonus(event: ModifierAttackEvent): number {
        return this.armor
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.EVADE_DISABLED]: true,
        }
    }
}