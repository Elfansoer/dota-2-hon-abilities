import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class rhapsody_staccato extends ExtendedAbility {
    static reflected = false;

    OnSpellStart(): void {
        this.InitSpellStart();
        const duration = this.V("charge_duration");
        const stunDuration = this.V("initial_stun");
        const damage = this.V("initial_damage");
        const charges = this.V("charges");

        rhapsody_staccato.reflected = true;
        const spellAbsorb = this.targetUnit.TriggerSpellAbsorb(this);
        rhapsody_staccato.reflected = false;
        if (spellAbsorb) return;

        ApplyDamage({
            victim: this.targetUnit,
            attacker: this.caster,
            damage: damage,
            damage_type: this.GetAbilityDamageType(),
            ability: this,
        });

        this.targetUnit.AddNewModifier(
            this.caster,
            this,
            "modifier_stunned",
            {duration: stunDuration}
        );

        // only give charges when not reflected
        if (rhapsody_staccato.reflected) return;

        modifier_rhapsody_staccato.apply(
            this.caster,
            this.caster,
            this,
            {duration}
        )?.SetStackCount(charges);
    }
}

@registerAbility()
export class rhapsody_staccato_charge extends ExtendedAbility {
    OnSpellStart(): void {
        this.InitSpellStart();
        modifier_rhapsody_staccato.find(this.caster)?.Cast();
    }
}

@registerModifier()
export class modifier_rhapsody_staccato extends ExtendedAbilityModifier {
    duration = this.V("charge_duration");
    stunDuration = this.V("charge_stun");
    damage = this.V("charge_damage");

    target!: CDOTA_BaseNPC;

    OnCreated(params: {radius: number}): void {
        if (!IsServer()) return;
        // TODO stolen behavior
        this.parent.SwapAbilities(
            rhapsody_staccato.name,
            rhapsody_staccato_charge.name,
            false,
            true
        );
    }

    OnDestroy(): void {
        if (!IsServer()) return;
        this.parent.SwapAbilities(
            rhapsody_staccato.name,
            rhapsody_staccato_charge.name,
            true,
            false
        );        
    }

    Init( target: CDOTA_BaseNPC ) {
        this.target = target;
    }

    Cast() {
        ApplyDamage({
            victim: this.target,
            attacker: this.caster,
            damage: this.damage,
            damage_type: this.damageType,
            ability: this.ability,
        });

        this.target.AddNewModifier(
            this.caster,
            this.ability,
            "modifier_stunned",
            {duration: this.stunDuration}
        );

        // decrement stack
        this.DecrementStackCount();
        if (this.GetStackCount()<1) {
            this.Destroy();
        } else {
            this.SetDuration( this.duration, true );
        }
    }
}