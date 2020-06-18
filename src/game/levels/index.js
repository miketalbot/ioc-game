import { handle, raise } from "../../lib/event-bus"

let currentLevel = 0


handle("startGame", () => {
    raise("setFirstLevel", currentLevel)
    currentLevel = 0
    raise("newLevel")
})


handle("newLevel", (levelNumber = currentLevel + 1) => {
    raise("endLevel")
    currentLevel = levelNumber
    const [configuredLevels] = raise("get-levels", [])
    if (configuredLevels.length >= levelNumber) {
        const levelSpec = { ...configuredLevels[currentLevel - 1], levelNumber }
        raise("levelReady", levelSpec)
    } else {
        const steps = (3 + Math.random() * 3) | 0
        const levelSpec = {
            levelNumber,
            mission: [],
        }
        raise("initializeLevel", levelSpec)
        const [allocators] = raise("getLevelAllocators", [], levelSpec)
        let allocator = (Math.random() * allocators.length) | 0
        for(let i =0 ; i < steps && allocators.length; i++, allocator++) {
            const step = {}
            if(allocators[allocator % allocators.length](step, levelSpec) === false) {
                allocators.splice(allocator, 1)
            } else {
                levelSpec.mission.push(step)
            }
        }
        levelSpec.time = levelSpec.mission.length * 5 + 55 - Math.random() * 10 | 0
        raise("levelReady", levelSpec)
    }
})


