import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";
import { artesia_arcane_bolt, modifier_artesia_arcane_bolt_heal_mode } from "./artesia_arcane_bolt";
import { artesia_arcane_missile } from "./artesia_arcane_missile";
import { artesia_dance_of_death } from "./artesia_dance_of_death";

@registerAbility()
export class artesia_essence_projection extends ExtendedAbility {
    OnSpellStart(): void {
        this.InitSpellStart();
        const duration = this.V("duration");

        CreateUnitByNameAsync(
            "npc_dota_artesia_essence_projection",
            this.targetPoint,
            false,
            this.caster,
            this.caster,
            this.teamNumber,
            (unit)=>{
                modifier_artesia_essence_projection_unit.apply(
                    unit,
                    this.caster,
                    this,
                    {duration}
                );
            }
        )
    }
}

@registerModifier()
export class modifier_artesia_essence_projection_unit extends ExtendedAbilityModifier {
    radius = this.V("radius");
    maxHealth = this.V("max_health");
    health = this.maxHealth;
    copyAbilities = [ artesia_arcane_missile.name, artesia_dance_of_death.name, artesia_arcane_bolt.name ];

    IsPurgable(): boolean {
        return false;
    }

    OnCreated(params: object): void {
        if (!IsServer()) return;
        this.parent.AddAbility(artesia_arcane_bolt.name)
            .SetLevel( this.caster.FindAbilityByName( artesia_arcane_bolt.name )?.GetLevel() ?? 0 );
    }

    OnDestroy(): void {
        if (!IsServer()) return;
        this.parent.ForceKill(false);
    }

    IsAura() {
        return true;
    }

    GetModifierAura(): string {
        return modifier_artesia_essence_projection.name;
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


    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ON_ABILITY_FULLY_CAST,
            ModifierFunction.COOLDOWN_PERCENTAGE,
            ModifierFunction.MANACOST_PERCENTAGE,

            ModifierFunction.LIFETIME_FRACTION,
            ModifierFunction.HEALTHBAR_PIPS,
            ModifierFunction.ON_ATTACK_LANDED,
        ];
    }

    OnAbilityFullyCast(event: ModifierAbilityEvent): void {
        if (event.unit!=this.caster) return;
        const abilityName = event.ability.GetAbilityName();
        if (!this.copyAbilities.includes(abilityName)) return;

        const ability = this.parent.FindAbilityByName( abilityName )
            ?? this.parent.AddAbility( abilityName );
        ability.SetLevel( event.ability.GetLevel() );

        this.parent.SetCursorCastTarget(event.ability.GetCursorTarget());
        this.parent.SetCursorPosition(event.ability.GetCursorPosition());
        ability.CastAbility();
    }

    GetModifierPercentageCooldown(): number {
        return 99;
    }

    GetModifierPercentageManacost(): number {
        return 99;
    }

    OnAttackLanded(event: ModifierAttackEvent): void {
        if (event.target!=this.parent) return;
        if (this.health--<0) this.Destroy();
    }

    GetUnitLifetimeFraction(): number {
        return this.GetRemainingTime()/this.GetDuration();
    }

    GetModifierHealthBarPips(): number {
        return this.maxHealth;
    }
}

@registerModifier()
export class modifier_artesia_essence_projection extends ExtendedAbilityModifier {
    regen = this.V("regen");

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.HEALTH_REGEN_CONSTANT,
            ModifierFunction.MANA_REGEN_CONSTANT,
        ]
    }

    GetModifierConstantHealthRegen(): number {
        return this.caster.HasModifier( modifier_artesia_arcane_bolt_heal_mode.name )
            ? this.regen
            : 0;
    }

    GetModifierConstantManaRegen(): number {
        return this.caster.HasModifier( modifier_artesia_arcane_bolt_heal_mode.name )
            ? 0
            : this.regen;
    }
}