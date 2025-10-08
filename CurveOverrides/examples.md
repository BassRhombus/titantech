# Curve Overrides Generator

## Format

Curve overrides in Game.ini follow this format:

```ini
[/Script/PathOfTitans.IGameSession]
CurveOverrides=(Curve="/Game/Path/To/DinosaurName.CurveName",Keys=((Time=0.0,Value=X.X),(Time=0.25,Value=X.X),(Time=0.5,Value=X.X),(Time=0.75,Value=X.X),(Time=1.0,Value=X.X)))
```

## Examples

### Growth Curve Override
```ini
CurveOverrides=(Curve="/Game/Dinosaurs/Allosaurus.GrowthRate",Keys=((Time=0.0,Value=0.0),(Time=0.25,Value=0.3),(Time=0.5,Value=0.6),(Time=0.75,Value=0.85),(Time=1.0,Value=1.0)))
```

### Damage Curve Override
```ini
CurveOverrides=(Curve="/Game/Dinosaurs/Ceratosaurus.BiteDamage",Keys=((Time=0.0,Value=50.0),(Time=0.25,Value=75.0),(Time=0.5,Value=100.0),(Time=0.75,Value=125.0),(Time=1.0,Value=150.0)))
```

### Stamina Curve Override
```ini
CurveOverrides=(Curve="/Game/Dinosaurs/Triceratops.StaminaDrain",Keys=((Time=0.0,Value=1.0),(Time=0.25,Value=0.9),(Time=0.5,Value=0.8),(Time=0.75,Value=0.7),(Time=1.0,Value=0.6)))
```

## Common Curves

- **Growth**: GrowthRate, GrowthSpeed
- **Combat**: BiteDamage, ClawDamage, TailDamage
- **Movement**: SprintSpeed, WalkSpeed, SwimSpeed
- **Stamina**: StaminaDrain, StaminaRecovery
- **Health**: HealthRegeneration, MaxHealth
- **Food/Water**: FoodDrain, WaterDrain, FoodCapacity, WaterCapacity

## Notes

- Time values are always 0.0, 0.25, 0.5, 0.75, 1.0 (representing growth stages)
- Value numbers can be decimals or integers
- Curve paths must match exact dinosaur names (case-sensitive)
- Multiple curve overrides can be defined for the same dinosaur
