import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { ExtendedAbility } from "../lib/extended_ability";
import { ExtendedAbilityModifier } from "../lib/extended_modifier";

@registerAbility()
export class ellonia_absolute_zero extends ExtendedAbility {
    Precache(context: CScriptPrecacheContext) {
        PrecacheResource( "soundfile", "soundevents/game_sounds_heroes/game_sounds_crystalmaiden.vsndevts", context );
    }

    OnSpellStart(): void {
        const targetPoint = this.GetCursorPosition();

        const range = this.GetCastRange(targetPoint,undefined);
        const duration = this.V( "duration" );
        const radius = this.V( "radius" );
        const interval = this.V( "interval" );
        const damage = this.V( "damage" );
        const frostedDuration = this.V( "frosted_duration" );
        const frostedCount = this.V( "frosted_count" );
        const shouldReturn = this.V( "should_return" )==1;

        const CreateProjectile = ( location: Vector, returnProjectile: boolean )=>{
            this.CreateLinearProjectile({
                populateDefaultValues: true,
                EffectName: "particles/units/heroes/hero_puck/puck_illusory_orb.vpcf",
                vSpawnOrigin: location,
                fSpeed: range/duration,
                vDirection: ((returnProjectile ? -1 : 1) *this.GetCastDirection()) as Vector, 
                fDistance: range,
                fRadius: radius,
                OnProjectileThink: (location: Vector)=>{
                    const enemies = FindUnitsInRadius(
                        this.teamNumber,
                        location,
                        undefined,
                        radius,
                        this.GetAbilityTargetTeam(),
                        this.GetAbilityTargetType(),
                        this.GetAbilityTargetFlags(),
                        FindOrder.ANY,
                        false
                    );
        
                    for (const enemy of enemies) {
                        const distance = (enemy.GetOrigin() - location as Vector).Length2D();
                        const actualDamage = math.max( 0, 1-distance/radius ) * damage;
        
                        ApplyDamage({
                            victim: enemy,
                            attacker: this.caster,
                            damage: actualDamage,
                            damage_type: this.GetAbilityDamageType(),
                            ability: this,
                        });
        
                        modifier_ellonia_common_frosted.apply(
                            enemy,
                            this.caster,
                            this,
                            {
                                duration: frostedDuration,
                                count: frostedCount,
                            }
                        )
        
                        if (returnProjectile) {
                            
                            const ability = this.caster.FindAbilityByName( "ellonia_flash_freeze" );
                            if (ability) {
                                const stunModifier = enemy.FindAllModifiersByName( "modifier_stunned" ).find((modifier)=>modifier.GetAbility()==ability);
                                if (!stunModifier) {
                                    this.caster.SetCursorCastTarget( enemy );
                                    ability.OnSpellStart();
                                }
                            }
                        }
                    }
                    return interval;
                },
                OnProjectileEnd: (location: Vector)=>{
                    if ( shouldReturn && !returnProjectile ) {
                        CreateProjectile( location, true );
                    }
                }
            });
        }
        CreateProjectile( this.caster.GetOrigin(), false );
    }
}

@registerModifier()
export class modifier_ellonia_common_frosted extends ExtendedAbilityModifier {
    OnCreated(params: {count: number}) {
        if (!IsServer()) return;
        this.SetStackCount( this.GetStackCount() + params.count );
    }
    OnRefresh(params: {count: number}) {
        this.OnCreated(params);
    }
}