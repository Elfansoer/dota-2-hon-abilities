import { BaseAbility } from "./dota_ts_adapter";

export type ExtendedLinearProjectileData = CreateLinearProjectileOptions & {
    populateDefaultValues?: boolean,
    fRadius?: number,
    fSpeed?: number,
    SoundName?: string,
    destroyTreeRadius?: number;
    OnProjectileHit?: (target: CDOTA_BaseNPC, location: Vector)=>boolean | void,
    OnProjectileThink?: (location: Vector)=>number,
    OnProjectileEnd?: (location: Vector)=>void,
    // ExtraData?: Object,
}

export type ExtendedTrackingProjectileData = CreateTrackingProjectileOptions & {
    Target: CDOTA_BaseNPC,
    iMoveSpeed: number,
    populateDefaultValues?: boolean,
    SoundName?: string,
    destroyTreeRadius?: number;
    OnProjectileHit?: (target: CDOTA_BaseNPC)=>void,
    OnProjectileThink?: (location: Vector)=>number,
    OnProjectileDodge?: (location: Vector)=>void,
    // ExtraData?: Object,
}

type ProjectileData = {
    type: "linear",
    id: ProjectileID,
    SoundName?: string,
    thinker?: CDOTA_BaseNPC,
    destroyTreeRadius?: number,
    nextThinkTime: number,
    OnProjectileHit: (target: CDOTA_BaseNPC, location: Vector)=>boolean | void,
    OnProjectileThink: (location: Vector)=> number,
    OnProjectileEnd: (location: Vector)=>void,
} | {
    type: "tracking",
    id: ProjectileID,
    SoundName?: string,
    thinker?: CDOTA_BaseNPC,
    destroyTreeRadius?: number,
    nextThinkTime: number,
    OnProjectileHit: (target: CDOTA_BaseNPC)=>void,
    OnProjectileThink: (location: Vector)=>number,
    OnProjectileDodge: (location: Vector)=>void,
}

export class ExtendedAbility extends BaseAbility {
    caster = this.GetCaster();
    teamNumber = this.caster.GetTeamNumber();
    projectiles: LuaMap<ProjectileID,ProjectileData> = new LuaMap;

    //--------------------------------
    // commonly used functions
    GetCastDirection() {
        let direction = (this.GetCursorPosition() - this.caster.GetOrigin()) as Vector;
        direction.z = 0;
        return direction.Length2D()<0 ? direction.Normalized() : this.caster.GetForwardVector(); 
    }

    V(v: string) {
        return this.GetSpecialValueFor(v);
    }

    //--------------------------------
    // better projectile management
    CreateSoundThinker( soundName: string | undefined, origin: Vector ) {
        let thinker = undefined;
        if (soundName) {
            thinker = CreateModifierThinker(
                this.caster,
                this,
                "",
                {},
                origin,
                this.caster.GetTeamNumber(),
                false
            );
            EmitSoundOn(soundName,thinker);
        }
        return thinker
    }

    CreateLinearProjectile(elpd: ExtendedLinearProjectileData) {
        // populating default data
        if (elpd.populateDefaultValues==true) {
            elpd.Ability ??= this;
            elpd.Source ??= this.caster;
            elpd.vSpawnOrigin ??= this.caster.GetOrigin();
            elpd.iUnitTargetTeam ??= this.GetAbilityTargetTeam();
            elpd.iUnitTargetType ??= this.GetAbilityTargetType();
            elpd.iUnitTargetFlags ??= this.GetAbilityTargetFlags();
            elpd.fDistance ??= 100;
            elpd.fStartRadius ??= elpd.fRadius ?? 0;
            elpd.fEndRadius ??= elpd.fRadius ?? 0;
            elpd.vVelocity ??= (elpd.fSpeed ?? 0) * this.GetCastDirection() as Vector;    
        }

        // create projectile and thinker for sound
        const id = ProjectileManager.CreateLinearProjectile(elpd);
        const soundThinker = this.CreateSoundThinker(elpd.SoundName, elpd.vSpawnOrigin ?? this.caster.GetOrigin() );

        // store data
        this.projectiles.set(id,{
            type: "linear",
            id: id,
            thinker: soundThinker,
            SoundName: elpd.SoundName,
            destroyTreeRadius: elpd.destroyTreeRadius,
            nextThinkTime: GameRules.GetGameTime() + FrameTime(),
            OnProjectileHit: elpd.OnProjectileHit ?? (()=>{}),
            OnProjectileThink: elpd.OnProjectileThink ?? (()=>-1),
            OnProjectileEnd: elpd.OnProjectileEnd ?? (()=>{}),
        });

        return id;
    }

    CreateTrackingProjectile(etpd: ExtendedTrackingProjectileData) {
        // populating default data
        if (etpd.populateDefaultValues==true) {
            etpd.Ability ??= this;
            etpd.Source ??= this.caster;
        }

        // create thinker
        const id = ProjectileManager.CreateTrackingProjectile(etpd);
        const soundThinker = this.CreateSoundThinker( etpd.SoundName, etpd.Source?.GetOrigin() || this.caster.GetOrigin() );

        this.projectiles.set(id,{
            type: "tracking",
            id: id,
            thinker: soundThinker,
            SoundName: etpd.SoundName,
            destroyTreeRadius: etpd.destroyTreeRadius,
            nextThinkTime: GameRules.GetGameTime() + FrameTime(),
            OnProjectileHit: etpd.OnProjectileHit ?? (()=>{}),
            OnProjectileThink: etpd.OnProjectileThink ?? (()=>-1),
            OnProjectileDodge: etpd.OnProjectileDodge ?? (()=>{}),
        });

        return id;
    }

    DestroyProjectile( id: ProjectileID ) {
        const info = this.projectiles.get(id);
        if (!info) return;

        // remove sound thinker
        if (info.SoundName && info.thinker) {
            StopSoundOn(info.SoundName,info.thinker);
            UTIL_Remove( info.thinker );
        }
        
        // remove data
        this.projectiles.delete( id );
        
        // remove projectile
        if (info.type=="linear") {
            ProjectileManager.DestroyLinearProjectile(id);
        } else {
            ProjectileManager.DestroyTrackingProjectile(id);
        }
    }

    // Do not override
    OnProjectileThinkHandle(id: ProjectileID) {
        const info = this.projectiles.get(id);
        if (!info) return;

        const location = info.type=="linear"
            ? ProjectileManager.GetLinearProjectileLocation( info.id )
            : ProjectileManager.GetTrackingProjectileLocation( info.id );

        // set sound thinker position
        info.thinker?.SetOrigin(location);
        
        // destroy trees
        if (info.destroyTreeRadius) {
            GridNav.DestroyTreesAroundPoint( location, info.destroyTreeRadius, true );
        }

        // run projectile think
        if (info.nextThinkTime >= GameRules.GetGameTime()) {
            let nextTime = info.OnProjectileThink(location);
            nextTime = nextTime==0 ? FrameTime() : nextTime;
            info.nextThinkTime = GameRules.GetGameTime() + nextTime;
        };
    }

    // Do not override
    OnProjectileHitHandle(target: CDOTA_BaseNPC | undefined, location: Vector, id: ProjectileID) {
        const info = this.projectiles.get(id);
        if (!info) return;

        if (info.type=="linear") {
            if (target) {
                return info.OnProjectileHit(target,location);
            } else {
                info.OnProjectileEnd(location);
                this.DestroyProjectile(info.id);
            }    
        } else {
            if (target) {
                return info.OnProjectileHit(target);
            } else {
                info.OnProjectileDodge(location);
                this.DestroyProjectile(info.id);
            }    
        }
    }
}
