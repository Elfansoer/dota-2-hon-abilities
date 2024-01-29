import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

/*
UNFINISHED
Cover of Darkness
Covers an area in absolute darkness.
Allied heroes inside are invisible and truesight immune.

Enemy heroes inside are slowed, untargetable by enemies, and not visible.
They are fixed in place, and a point will follow enemy move orders.
Once point is out, the hero is teleported to the point.
*/
@registerAbility()
export class dark_lady_cover_of_darkness extends ExtendedAbility {
    OnSpellStart(): void {
        this.InitSpellStart();
        const duration = this.V("duration");
        modifier_dark_lady_cover_of_darkness.thinker(
            this.targetPoint,
            false,
            this.caster,
            this,
            {duration}
        );
    }
}

@registerModifier()
export class modifier_dark_lady_cover_of_darkness_aura extends ExtendedAbilityModifier {
    radius = this.V("radius");

    IsAura() {
        return true;
    }

    GetModifierAura(): string {
        return modifier_dark_lady_cover_of_darkness.name;
    }

    GetAuraRadius() {
        return this.radius;
    }

    GetAuraSearchTeam() {
        return UnitTargetTeam.FRIENDLY;
    }

    GetAuraSearchType() {
        return UnitTargetType.HERO;
    }
}

@registerModifier()
export class modifier_dark_lady_cover_of_darkness extends ExtendedAbilityModifier {
    baseDamage = this.V("base_damage");
    silence = this.V("silence");

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.INVISIBLE]: true,
            [ModifierState.TRUESIGHT_IMMUNE]: true,
        }
    }

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