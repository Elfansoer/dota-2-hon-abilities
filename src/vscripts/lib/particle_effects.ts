enum ParticleEffectName {
    ["LinaLightStrikeArray1"] = "particles/units/heroes/hero_lina/lina_spell_light_strike_array_ray_team.vpcf",
    ["LinaLightStrikeArray2"] = "particles/units/heroes/hero_lina/lina_spell_light_strike_array.vpcf",
    ["LinaLagunaBlade"] = "particles/units/heroes/hero_lina/lina_spell_laguna_blade.vpcf",
}

export namespace ParticleEffect {
    export function LinaLightStrikeArrayInit( caster: CDOTA_BaseNPC, point: Vector, radius: number ) {
        ParticleEffectBase.LinaLightStrikeArrayInit(
            ParticleEffectName.LinaLightStrikeArray1,
            { caster, point, radius }
        );
    }

    export function LinaLightStrikeArray( point: Vector, radius: number ) {
        ParticleEffectBase.LinaLightStrikeArray(
            ParticleEffectName.LinaLightStrikeArray2,
            {point,radius}
        );
    }

    export function LinaLagunaBlade( caster: CDOTA_BaseNPC, target: CDOTA_BaseNPC ) {
        ParticleEffectBase.LinaLagunaBlade(
            ParticleEffectName.LinaLagunaBlade,
            {caster,target}
        );
    }

    export function GenericAreaPulse( options: {point: Vector, radius: number} ) {
        const fxName = "particles/units/heroes/hero_dark_willow/dark_willow_leyconduit_marker_helper.vpcf";
        const pfx = ParticleManager.CreateParticle( fxName, ParticleAttachment.WORLDORIGIN, undefined );
        ParticleManager.SetParticleControl( pfx, 0, options.point );
        ParticleManager.SetParticleControl( pfx, 2, Vector( options.radius, options.radius, options.radius ) )
        ParticleManager.ReleaseParticleIndex( pfx );
    }
}

namespace ParticleEffectBase {
    export function LinaLightStrikeArrayInit( fx: string, options: {caster: CDOTA_BaseNPC, point: Vector, radius: number} ) {
        const fxid = ParticleManager.CreateParticleForTeam(
            fx,
            ParticleAttachment.WORLDORIGIN,
            options.caster,
            options.caster.GetTeamNumber()
        );
        ParticleManager.SetParticleControl( fxid, 0, options.point );
        ParticleManager.SetParticleControl( fxid, 1, Vector( options.radius, 1, 1 ) );
        ParticleManager.ReleaseParticleIndex( fxid );
    }

    export function LinaLightStrikeArray( fx: string, options: {point: Vector, radius: number} ) {
        const fxid = ParticleManager.CreateParticle(
            fx,
            ParticleAttachment.WORLDORIGIN,
            undefined
        );
        ParticleManager.SetParticleControl( fxid, 0, options.point );
        ParticleManager.SetParticleControl( fxid, 1, Vector( options.radius, 1, 1 ) );
        ParticleManager.ReleaseParticleIndex( fxid );
    }

    export function LinaLagunaBlade( fx: string, options: {caster: CDOTA_BaseNPC, target: CDOTA_BaseNPC} ) {
        const fxid = ParticleManager.CreateParticle(
            fx,
            ParticleAttachment.CUSTOMORIGIN,
            undefined
        );
        ParticleManager.SetParticleControlEnt(
            fxid,
            0,
            options.caster,
            ParticleAttachment.POINT_FOLLOW,
            "attach_attack1",
            Vector(0,0,0),
            true
        );
        ParticleManager.SetParticleControlEnt(
            fxid,
            1,
            options.target,
            ParticleAttachment.POINT_FOLLOW,
            "attach_hitloc",
            Vector(0,0,0),
            true
        );
        ParticleManager.ReleaseParticleIndex( fxid );
    }
}

// experimental
export namespace ParticleEffectExperimental {
    export function LinaLightStrikeArray( options: {caster: CDOTA_BaseNPC, point: Vector, radius: number} ) {
        const fxNames = {
            fxStart: "particles/units/heroes/hero_lina/lina_spell_light_strike_array_ray_team.vpcf",
            fxFinish: "particles/units/heroes/hero_lina/lina_spell_light_strike_array.vpcf",
        }

        const data = {
            fxNames,
            ReplaceParticle: (original: keyof typeof fxNames, replacement: string)=>{
                fxNames[original] = replacement;
                return data;
            },
            EffectStart: ()=>{
                ParticleEffectBase.LinaLightStrikeArrayInit(fxNames.fxStart,options);
                return data;
            },
            EffectFinish: ()=>{
                ParticleEffectBase.LinaLightStrikeArray(fxNames.fxFinish,options);
                return data;
            },
            
        }

        return data;
    }
}