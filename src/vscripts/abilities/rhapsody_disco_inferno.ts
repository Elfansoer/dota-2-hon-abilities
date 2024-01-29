import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class rhapsody_disco_inferno extends ExtendedAbility {
    CastFilterResultTarget(target: CDOTA_BaseNPC): UnitFilterResult {
        return target!=this.caster ? UnitFilterResult.FAIL_CUSTOM : UnitFilterResult.SUCCESS;
    }
    
    GetCustomCastErrorTarget(target: CDOTA_BaseNPC): string {
        return target!=this.caster ? "#dota_hud_error_only_self" : "";
    }

    OnSpellStart(): void {
        this.InitSpellStart();
        const duration = this.V("duration");

        if (this.hasTargetUnit) {
            modifier_rhapsody_disco_inferno_aura.apply(
                this.caster,
                this.caster,
                this,
                {duration}
            );
        } else {
            modifier_rhapsody_disco_inferno_aura.thinker(
                this.targetPoint,
                false,
                this.caster,
                this,
                {duration}
            );
        }
    }
}

@registerModifier()
export class modifier_rhapsody_disco_inferno_aura extends ExtendedAbilityModifier {
    radius = this.V("radius");

    OnDestroy(): void {
        if (!IsServer()) return;
        if (this.parent!=this.caster) UTIL_Remove(this.parent);
    }

    IsAura() {
        return true
    }

    GetModifierAura(): string {
        return modifier_rhapsody_disco_inferno.name;
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
}

export class modifier_rhapsody_disco_inferno extends ExtendedAbilityModifier {
    damage = this.V( "damage" );
    damageMultiplier = this.V( "damage_multiplier" )/100;
    heal = this.V( "heal" );
    healMultiplier = this.V( "heal_multiplier" )/100;
    creepMultiplier = this.parent.IsHero() ? 1 : this.V("creep_multiplier")/100;
    interval = this.V("interval");
    lastPosition = this.parent.GetAbsOrigin();
    distanceThreshold = 50*this.interval;
    isAlly = this.parent.GetTeamNumber()==this.caster.GetTeamNumber();

    OnCreated(params: object): void {
        if (!IsServer()) return;
        this.StartIntervalThink(this.interval);
        this.OnIntervalThink();
    }

    OnIntervalThink(): void {
        const currentPos = this.parent.GetOrigin();
        const isMoving = (currentPos - this.lastPosition as Vector).Length2D()>this.distanceThreshold;
        if (this.isAlly) {
            const heal = this.heal * this.interval * this.creepMultiplier * (isMoving ? this.healMultiplier : 1);
            this.parent.HealWithParams( heal, this.ability, false, true, this.caster, false );
            SendOverheadEventMessage(
                undefined,
                OverheadAlert.HEAL,
                this.parent,
                heal,
                this.caster.GetPlayerOwner()
            );
        } else {
            const damage = this.damage * this.interval * this.creepMultiplier * (isMoving ? this.damageMultiplier : 1);
            ApplyDamage({
                victim: this.parent,
                attacker: this.caster,
                damage: damage,
                damage_type: this.damageType,
                ability: this.ability,
            });
            SendOverheadEventMessage(
                undefined,
                OverheadAlert.BONUS_SPELL_DAMAGE,
                this.parent,
                damage,
                this.caster.GetPlayerOwner()
            );
        }
    }
}