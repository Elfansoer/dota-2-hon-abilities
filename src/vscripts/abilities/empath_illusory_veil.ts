import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class empath_illusory_veil extends ExtendedAbility {
    OnSpellStart(): void {
        this.InitSpellStart();
        const duration = this.V( "duration" );

        modifier_empath_illusory_veil_thinker.thinker(
            this.targetPoint,
            false,
            this.caster,
            this,
            {duration},
        ).modifier.Init( this.targetDirection );
    }
}

@registerModifier()
export class modifier_empath_illusory_veil_thinker extends ExtendedAbilityModifier {
    length = this.V( "length" );
    blockWidth = this.V( "block_width" );
    damageWidth = this.V( "damage_width" );
    vision = this.V( "vision_radius" );

    initialized = false;
    wallStartPoint!: Vector;
    wallEndPoint!: Vector;
    wallAngle!: number;

    Init( direction: Vector ) {
        this.parent.SetForwardVector( direction );

        // define wall
        const origin = this.parent.GetOrigin();
        const right = this.parent.GetRightVector();
        this.wallStartPoint = origin + right * this.length/2 as Vector
        this.wallEndPoint = origin - right * this.length/2 as Vector
        this.wallAngle = VectorToAngles( right ).y;

        // give vision
        const AddVision = (location: Vector)=>{
            return AddFOWViewer(this.teamNumber,location,this.vision,this.GetDuration(),false);
        }
        let distance = 0;
        while ( distance<this.length/2 ) {
            distance += this.vision;
            AddVision( origin + right * distance as Vector );
            AddVision( origin - right * distance as Vector );
        }
        AddVision( origin );

        this.initialized = true;
    }

    IsUnitBlockedByWall( unit: CDOTA_BaseNPC ) {
        let localOrigin = unit.GetOrigin() - this.parent.GetOrigin() as Vector;
        localOrigin = RotatePosition( Vector(0,0,0), QAngle(0,-this.wallAngle,0), localOrigin );
        const localFacing = RotatePosition( Vector(0,0,0), QAngle(0,-this.wallAngle,0), unit.GetForwardVector() );

        return (localFacing.y * localOrigin.y < 0) && (math.abs( localOrigin.y ) < this.blockWidth);
    }

    IsUnitWithinWallDamage( unit: CDOTA_BaseNPC ) {
        return CalcDistanceToLineSegment2D( unit.GetOrigin(), this.wallStartPoint, this.wallEndPoint ) < this.damageWidth;
    }

    IsAura() {
        return this.initialized;
    }

    GetModifierAura(): string {
        return modifier_empath_illusory_veil.name;
    }

    GetAuraRadius() {
        return this.length/2;
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

@registerModifier()
export class modifier_empath_illusory_veil extends ExtendedAbilityModifier {
    damage = this.V( "damage" );
    interval = this.V( "interval" );

    auraModifier!: modifier_empath_illusory_veil_thinker;

    OnCreated(params: object): void {
        if (!IsServer()) return;

        this.auraModifier = modifier_empath_illusory_veil_thinker.find(this.caster)!;
        this.StartIntervalThink(this.interval);
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.MOVESPEED_LIMIT,
        ]
    }

    GetModifierMoveSpeed_Limit(): number {
        if (!IsServer()) return 0;
        return this.auraModifier.IsUnitBlockedByWall( this.parent ) ? 0.1 : 0;
    }
    
    OnIntervalThink(): void {
        if (this.auraModifier.IsUnitWithinWallDamage( this.parent )) {
            ApplyDamage({
                victim: this.parent,
                attacker: this.caster,
                damage: this.damage * this.interval,
                damage_type: this.damageType,
                ability: this.ability,
            });
        }
    }
}