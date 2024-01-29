import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class riftwalker_wormhole extends ExtendedAbility {
    OnChannelFinish(interrupted: boolean) {
        if (interrupted) return;

        this.InitSpellStart();
        const radius = this.V("radius");
        const damage = this.V("damage");
        const duration = this.V("stun_duration");
        const bidirectional = this.V("bidirectional")==1;
        
        // destroy trees
        GridNav.DestroyTreesAroundPoint(this.targetPoint,radius,true);

        // add return ability
        if (bidirectional) {
            modifier_riftwalker_bidirectional_wormhole.apply(
                this.caster,
                this.caster,
                this,
                {
                    duration: duration,
                    radius: radius,
                }
            );
        }

        // teleport
        FindClearSpaceForUnit( this.caster, this.targetPoint, true );

        const enemies = FindUnitsInRadius(
            this.teamNumber,
            this.targetPoint,
            undefined,
            radius,
            this.GetAbilityTargetTeam(),
            this.GetAbilityTargetType(),
            this.GetAbilityTargetFlags(),
            FindOrder.ANY,
            false
        );

        for (const enemy of enemies) {
            ApplyDamage({
                victim: enemy,
                attacker: this.caster,
                damage: damage,
                damage_type: this.GetAbilityDamageType(),
                ability: this,
            });

            enemy.AddNewModifier(
                this.caster,
                this,
                "modifier_stunned",
                {duration}
            )
        }
    }
}

export class riftwalker_bidirectional_wormhole extends ExtendedAbility {
    OnSpellStart() {
        this.InitSpellStart();
        const castLocation = this.caster.GetOrigin();

        // find modifier
        const modifier = modifier_riftwalker_bidirectional_wormhole.find(this.caster);
        if (!modifier) return;
        
        GridNav.DestroyTreesAroundPoint( modifier.initialCastLocation, modifier.radius, true );

        // teleport back
        FindClearSpaceForUnit( this.caster, modifier.initialCastLocation, true );

        const enemies = FindUnitsInRadius(
            this.teamNumber,
            this.targetPoint,
            undefined,
            modifier.radius,
            this.GetAbilityTargetTeam(),
            this.GetAbilityTargetType(),
            this.GetAbilityTargetFlags(),
            FindOrder.ANY,
            false
        );

        for (const enemy of enemies) {
            const relativePos = enemy.GetOrigin() - castLocation as Vector;
            FindClearSpaceForUnit( enemy, this.caster.GetOrigin() + relativePos as Vector, true );
        }
    }
}

@registerModifier()
export class modifier_riftwalker_bidirectional_wormhole extends ExtendedAbilityModifier {
    initialCastLocation = this.parent.GetAbsOrigin();
    radius = 0;

    IsPurgable(): boolean {
        return false;
    }

    IsHidden(): boolean {
        return true;
    }

    OnCreated(params: {radius: number}): void {
        if (!IsServer()) return;
        this.radius = params.radius;

        // TODO stolen behavior
        this.parent.SwapAbilities(
            riftwalker_wormhole.name,
            riftwalker_bidirectional_wormhole.name,
            false,
            true
        );
    }

    OnDestroy(): void {
        if (!IsServer()) return;
        this.parent.SwapAbilities(
            riftwalker_wormhole.name,
            riftwalker_bidirectional_wormhole.name,
            true,
            false
        );        
    }
}