export namespace ParticleEffect {
    function ReturnValue<T>( fxid: ParticleID, modifyFunction: (options: T)=>void = ()=>{}, overhead: boolean = false ) {
        let destroyed = false;
        return {
            fxid,
            attach: (buff: CDOTA_Buff | undefined)=>{
                buff?.AddParticle(
                    fxid,
                    false,
                    false,
                    -1,
                    false,
                    overhead
                )
            },
            modify: modifyFunction,
            destroy: (immediate: boolean = false)=>{
                if (!destroyed) {
                    ParticleManager.DestroyParticle(fxid,immediate);
                    ParticleManager.ReleaseParticleIndex(fxid);
                }
            }
        } as const;
    }

    export function GenericAreaPulse( options: {point: Vector, radius: number} ) {
        const fxName = "particles/units/heroes/hero_dark_willow/dark_willow_leyconduit_marker_helper.vpcf";
        const pfx = ParticleManager.CreateParticle( fxName, ParticleAttachment.WORLDORIGIN, undefined );
        ParticleManager.SetParticleControl( pfx, 0, options.point );
        ParticleManager.SetParticleControl( pfx, 2, Vector( options.radius, options.radius, options.radius ) )
        ParticleManager.ReleaseParticleIndex( pfx );
    }

    export function CrystalMaidenCrystalNova( options: { fxName?: string, point: Vector, radius: number, duration: number} ) {
        const fxid = ParticleManager.CreateParticle(
            options.fxName ?? "particles/units/heroes/hero_crystalmaiden/maiden_crystal_nova.vpcf",
            ParticleAttachment.WORLDORIGIN,
            undefined
        );
        ParticleManager.SetParticleControl( fxid, 0, options.point );
        ParticleManager.SetParticleControl( fxid, 1, Vector( options.radius, options.duration, options.radius ) );
        ParticleManager.ReleaseParticleIndex( fxid );
    }

    export function CrystalMaidenFrostBite( options: { fxName?: string, target: CDOTA_BaseNPC} ) {
        const fxid = ParticleManager.CreateParticle(
            options.fxName ?? "particles/units/heroes/hero_crystalmaiden/maiden_frostbite_buff.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            options.target,
        );

        return ReturnValue(fxid);
    }

    export function LinaLightStrikeArrayInit( options: { fxName?: string, caster: CDOTA_BaseNPC, point: Vector, radius: number} ) {
        const fxid = ParticleManager.CreateParticleForTeam(
            options.fxName ?? "particles/units/heroes/hero_lina/lina_spell_light_strike_array_ray_team.vpcf",
            ParticleAttachment.WORLDORIGIN,
            options.caster,
            options.caster.GetTeamNumber()
        );
        ParticleManager.SetParticleControl( fxid, 0, options.point );
        ParticleManager.SetParticleControl( fxid, 1, Vector( options.radius, 1, 1 ) );
        ParticleManager.ReleaseParticleIndex( fxid );
    }

    export function LinaLightStrikeArray( options: { fxName?: string, point: Vector, radius: number} ) {
        const fxid = ParticleManager.CreateParticle(
            options.fxName ?? "particles/units/heroes/hero_lina/lina_spell_light_strike_array.vpcf",
            ParticleAttachment.WORLDORIGIN,
            undefined
        );
        ParticleManager.SetParticleControl( fxid, 0, options.point );
        ParticleManager.SetParticleControl( fxid, 1, Vector( options.radius, 1, 1 ) );
        ParticleManager.ReleaseParticleIndex( fxid );
    }

    export function LinaLagunaBlade( options: { fxName?: string, caster: CDOTA_BaseNPC, target: CDOTA_BaseNPC} ) {
        const fxid = ParticleManager.CreateParticle(
            options.fxName ?? "particles/units/heroes/hero_lina/lina_spell_laguna_blade.vpcf",
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

    export function LionManaDrain( options: { fxName?: string, caster: CDOTA_BaseNPC, target: CDOTA_BaseNPC} ) {
        const baseName = "particles/units/heroes/hero_lion/lion_spell_mana_drain.vpcf"

        const fxid = ParticleManager.CreateParticle(
            options.fxName ?? baseName,
            ParticleAttachment.ABSORIGIN_FOLLOW,
            options.target
        );
        ParticleManager.SetParticleControlEnt(
            fxid,
            0,
            options.target,
            ParticleAttachment.POINT_FOLLOW,
            "attach_hitloc",
            Vector(0,0,0),
            true
        )
        ParticleManager.SetParticleControlEnt(
            fxid,
            1,
            options.caster,
            ParticleAttachment.POINT_FOLLOW,
            "attach_mouth",
            Vector(0,0,0),
            true
        )

        return ReturnValue(fxid);
    }
}