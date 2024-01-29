import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class rhapsody_protective_melody extends ExtendedAbility {
    GetBehavior(): AbilityBehavior | Uint64 {
        return AbilityBehavior.NO_TARGET + this.V("notChannel")==1 ? AbilityBehavior.NONE : AbilityBehavior.CHANNELLED;
    }

    OnSpellStart() {
        this.InitSpellStart();
        const duration = this.V("duration");

        modifier_rhapsody_protective_melody_aura.apply(
            this.caster,
            this.caster,
            this,
            {duration}
        );
    }
}

@registerModifier()
export class modifier_rhapsody_protective_melody_aura extends ExtendedAbilityModifier {
    radius = this.V("radius");

    OnCreated(): void {
        if (!IsServer()) return;
        this.StartIntervalThink(0);
        this.OnIntervalThink();
    }

    OnIntervalThink(): void {
        if (this.parent.IsStunned() || this.parent.IsSilenced()) {
            this.Destroy();
        }
    }

    IsAura() {
        return true;
    }

    GetModifierAura(): string {
        return modifier_rhapsody_protective_melody.name;
    }

    GetAuraRadius() {
        return this.radius;
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

    GetAuraEntityReject(entity: CDOTA_BaseNPC) {
        return entity==this.parent;
    }
}

export class modifier_rhapsody_protective_melody extends ExtendedAbilityModifier {
    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ABSOLUTE_NO_DAMAGE_PHYSICAL,
            ModifierFunction.ABSOLUTE_NO_DAMAGE_MAGICAL,
        ]
    }

    GetAbsoluteNoDamagePhysical(): 0 | 1 {
        return 1;
    }
    
    GetAbsoluteNoDamageMagical(): 0 | 1 {
        return 1
    }
}