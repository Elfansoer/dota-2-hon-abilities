import { BaseModifier, BaseModifierMotionHorizontal } from "./dota_ts_adapter";
import { ExtendedAbility } from "./extended_ability";

export class ExtendedAbilityModifier<T extends ExtendedAbility = ExtendedAbility> extends BaseModifier {
    caster = this.GetCaster()!;
    parent = this.GetParent();
    ability = this.GetAbility()! as T;

    teamNumber = this.caster.GetTeamNumber();
    targetTeam = !IsServer() ? 0 : this.ability.GetAbilityTargetTeam();
    targetType = !IsServer() ? 0 : this.ability.GetAbilityTargetType();
    targetFlags = !IsServer() ? 0 : this.ability.GetAbilityTargetFlags();
    damageType = !IsServer() ? 0 : this.ability.GetAbilityDamageType();

    V(v: string) {
        return this.ability.GetSpecialValueFor(v);
    }

    ServerOrZero( fun: ()=>number ) {
        return IsServer() ? fun() : 0;
    }

    static IsNull( modifier: CDOTA_Buff | undefined ) {
        return modifier==undefined ? true : (modifier as unknown as CBaseEntity).IsNull();
    }
}

export class ExtendedAbilityModifierMotionHorizontal extends BaseModifierMotionHorizontal {
    caster = this.GetCaster()!;
    parent = this.GetParent();
    ability = this.GetAbility()!;

    teamNumber = this.caster.GetTeamNumber();
    targetTeam = !IsServer() ? 0 : this.ability.GetAbilityTargetTeam();
    targetType = !IsServer() ? 0 : this.ability.GetAbilityTargetType();
    targetFlags = !IsServer() ? 0 : this.ability.GetAbilityTargetFlags();
    damageType = !IsServer() ? 0 : this.ability.GetAbilityDamageType();
    
    V(v: string) {
        return this.ability.GetSpecialValueFor(v);
    }
}