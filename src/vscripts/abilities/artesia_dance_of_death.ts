import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";
import { artesia_arcane_bolt, modifier_artesia_arcane_bolt_shots } from "./artesia_arcane_bolt";
import { artesia_arcane_missile } from "./artesia_arcane_missile";

@registerAbility()
export class artesia_dance_of_death extends ExtendedAbility {
    OnSpellStart(): void {
        this.InitSpellStart();
        const duration = this.V("duration");
        const modifier = modifier_artesia_dance_of_death.find(this.caster);
        if (modifier) {
            this.UseResources(false,false,false,true);
            modifier.Destroy();
        } else {
            this.EndCooldown();
            modifier_artesia_dance_of_death.apply(
                this.caster,
                this.caster,
                this,
                {duration}
            );
        }
    }
}

@registerModifier()
export class modifier_artesia_dance_of_death extends ExtendedAbilityModifier {
    interval = this.V("interval");
    vision = this.V( "vision" );
    nextFireTime = GameRules.GetGameTime() - 1;
    missileAbility = this.parent.FindAbilityByName( artesia_arcane_missile.name );
    boltAbility = this.parent.FindAbilityByName( artesia_arcane_bolt.name );

    OnCreated(params: object): void {
        if (!IsServer()) return;
        this.StartIntervalThink( 0 );
    }

    OnIntervalThink(): void {
        // check stunned or silenced
        if (this.parent.IsStunned() || this.parent.IsSilenced()) {
            this.Destroy();
            return;
        }

        if (GameRules.GetGameTime() > this.nextFireTime) {
            this.nextFireTime += this.interval;

            // arcane bolt shots
            modifier_artesia_arcane_bolt_shots.apply(
                this.caster,
                this.caster,
                this.boltAbility,
                {bolts: 1}
            );
        }
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.FORCED_FLYING_VISION]: true,
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.OVERRIDE_ABILITY_SPECIAL,
            ModifierFunction.OVERRIDE_ABILITY_SPECIAL_VALUE,
            ModifierFunction.FIXED_DAY_VISION,
            ModifierFunction.FIXED_NIGHT_VISION,
        ]
    }

    GetModifierOverrideAbilitySpecial(event: ModifierOverrideAbilitySpecialEvent): 0 | 1 {
        if (event.ability!=this.missileAbility || event.ability!=this.boltAbility) return 0;
        switch (event.ability_special_value) {
            case "speed": return 1;
            case "should_pierce": return 1;
            case "interval": return 1;
            default: return 0;
        }
    }

    GetModifierOverrideAbilitySpecialValue(event: ModifierOverrideAbilitySpecialEvent): number {
        switch (event.ability_special_value) {
            case "speed": return this.missileAbility?.GetLevelSpecialValueNoOverride( "speed", event.ability_special_level ) ?? 0;
            case "should_pierce": return 1;
            case "interval": return this.interval;
            default: return 0;
        }
    }

    GetFixedDayVision(): number {
        return this.vision;
    }

    GetFixedNightVision(): number {
        return this.vision;
    }
}