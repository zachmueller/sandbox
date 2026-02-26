// ============================================================
// Choose Your Own Adventure: The Lost Temple
// ============================================================

// --- Story Data ---
// Each node has: text, choices (array of {text, next, [requires], [gives], [damage]}), or ending flag
const story = {
    start: {
        text: "You stand at the edge of a dense jungle, a crumbling map in your hand. According to the faded ink, the legendary Lost Temple of Azmar lies somewhere beyond the vine-covered ruins ahead.\n\nThe air is thick with humidity. You hear the distant call of exotic birds and the rustle of unseen creatures in the undergrowth.\n\nTwo paths diverge before you.",
        choices: [
            { text: "🌿 Take the overgrown trail through the jungle", next: "jungle_path" },
            { text: "🪨 Follow the dried-up riverbed", next: "riverbed" },
            { text: "🗺️ Study the map more carefully first", next: "study_map" }
        ]
    },

    study_map: {
        text: "You take a moment to carefully examine the map. In the corner, barely visible, you notice a small symbol — a warning of traps near the river, and a note about a \"hidden passage\" through the eastern jungle.\n\nThis knowledge might prove useful.",
        choices: [
            { text: "🌿 Take the overgrown trail (now knowing about the hidden passage)", next: "jungle_path_informed", gives: "map_knowledge" },
            { text: "🪨 Follow the dried-up riverbed (now aware of traps)", next: "riverbed_informed", gives: "map_knowledge" }
        ]
    },

    // --- Jungle Path ---
    jungle_path: {
        text: "You push through walls of green, vines catching at your arms and legs. After an hour of hard trekking, you stumble into a small clearing.\n\nIn the center sits a stone pedestal with a gleaming bronze compass resting on top. Nearby, you notice strange carvings on a moss-covered wall.",
        choices: [
            { text: "🧭 Take the compass", next: "take_compass" },
            { text: "🔍 Examine the wall carvings", next: "wall_carvings" },
            { text: "➡️ Ignore both and press onward", next: "jungle_deep" }
        ]
    },

    jungle_path_informed: {
        text: "Armed with knowledge from the map, you spot the hidden passage — a narrow gap behind a curtain of hanging vines that most would walk right past.\n\nThe passage leads to a shortcut through the jungle. You emerge in a clearing with a stone pedestal holding a bronze compass, and a moss-covered wall with carvings.",
        choices: [
            { text: "🧭 Take the compass", next: "take_compass" },
            { text: "🔍 Examine the wall carvings", next: "wall_carvings" },
            { text: "🚪 Look for the hidden passage mentioned on the map", next: "secret_tunnel", gives: "map_knowledge" }
        ]
    },

    take_compass: {
        text: "You lift the compass from the pedestal. It's heavier than expected, and the needle doesn't point north — it points deeper into the jungle, as if drawn toward the temple itself.\n\nThe moment you pick it up, you hear a low rumble. The pedestal sinks into the ground and the clearing shakes.",
        gives: "compass",
        choices: [
            { text: "🏃 Run deeper into the jungle following the compass", next: "jungle_deep" },
            { text: "🔍 Quickly examine the wall carvings before leaving", next: "wall_carvings_quick" }
        ]
    },

    wall_carvings: {
        text: "The carvings depict an ancient story: a great temple built to house a powerful artifact. Three trials guard the inner sanctum — a trial of wit, a trial of courage, and a trial of sacrifice.\n\nAt the bottom, you make out the words: \"Only the worthy may claim the Star of Azmar. The unworthy shall feed the jungle.\"",
        choices: [
            { text: "🧭 Now take the compass too", next: "take_compass" },
            { text: "➡️ Continue into the jungle with this knowledge", next: "jungle_deep", gives: "ancient_knowledge" }
        ]
    },

    wall_carvings_quick: {
        text: "As the ground shakes, you quickly scan the carvings. You catch a glimpse of three trials and a warning about worthiness before a crack splits the wall.\n\nTime to move!",
        gives: "ancient_knowledge",
        choices: [
            { text: "🏃 Follow the compass deeper into the jungle", next: "jungle_deep" }
        ]
    },

    secret_tunnel: {
        text: "Behind the vines, you find a narrow stone tunnel carved into the hillside. The walls are lined with phosphorescent moss, casting an eerie blue glow.\n\nThe tunnel winds downward for several minutes before opening into a vast underground chamber. You've found a back entrance to the temple!",
        gives: "ancient_knowledge",
        choices: [
            { text: "🏛️ Enter the temple through the back passage", next: "temple_back" }
        ]
    },

    jungle_deep: {
        text: "The jungle grows darker and more oppressive. Strange sounds echo around you — clicking, hissing, the crack of branches.\n\nSuddenly, you emerge before an enormous stone structure draped in vines. The Lost Temple of Azmar! Its entrance is a gaping dark mouth flanked by two crumbling serpent statues.\n\nBut you're not alone. You spot fresh bootprints in the mud.",
        choices: [
            { text: "🚪 Enter through the main entrance", next: "temple_entrance" },
            { text: "👣 Follow the bootprints around the side", next: "follow_prints" },
            { text: "🧗 Climb the exterior to find another way in", next: "climb_temple" }
        ]
    },

    // --- Riverbed Path ---
    riverbed: {
        text: "The dried riverbed is easier to walk but exposed to the blazing sun. Smooth stones crunch under your feet.\n\nAfter a while, you notice something glinting between the rocks — and further ahead, what appears to be a rope bridge spanning a deep ravine.",
        choices: [
            { text: "✨ Investigate the glinting object", next: "find_amulet" },
            { text: "🌉 Head straight for the rope bridge", next: "rope_bridge" }
        ]
    },

    riverbed_informed: {
        text: "The dried riverbed is easier to walk but exposed to the blazing sun. Thanks to the map, you watch your step carefully.\n\nYou spot a tripwire stretched across the path — a trap! You step over it safely. Beyond the trap, you notice something glinting between the rocks, and further ahead, a rope bridge.",
        choices: [
            { text: "✨ Investigate the glinting object", next: "find_amulet" },
            { text: "🌉 Head for the rope bridge (carefully)", next: "rope_bridge_safe" }
        ]
    },

    find_amulet: {
        text: "Wedged between two smooth river stones, you find a jade amulet on a leather cord. It's carved in the shape of a serpent eating its own tail. The craftsmanship is ancient but pristine.\n\nYou feel a faint warmth emanating from it.",
        gives: "jade_amulet",
        choices: [
            { text: "📿 Put it on and continue to the bridge", next: "rope_bridge" },
            { text: "🎒 Pocket it and continue to the bridge", next: "rope_bridge" }
        ]
    },

    rope_bridge: {
        text: "The rope bridge stretches across a dizzying chasm. The ropes are frayed and the wooden planks look rotten. Far below, you can hear rushing water.\n\nAs you step onto the first plank, it creaks ominously. Halfway across, a plank snaps under your foot!",
        damage: 20,
        choices: [
            { text: "💨 Sprint across before more planks break", next: "bridge_sprint" },
            { text: "🧘 Move slowly and carefully, testing each plank", next: "bridge_careful" }
        ]
    },

    rope_bridge_safe: {
        text: "The rope bridge stretches across a dizzying chasm. Knowing about the traps from the map, you test each plank methodically.\n\nYou find and avoid three weakened planks and make it across safely, arriving at a plateau with the temple visible in the distance.",
        choices: [
            { text: "🏛️ Approach the temple", next: "temple_entrance" }
        ]
    },

    bridge_sprint: {
        text: "You dash across as planks shatter behind you! With a final desperate leap, you grab the far edge just as the last section of bridge collapses into the void.\n\nHeart pounding, you pull yourself up onto solid ground. The temple looms ahead through the thinning jungle.",
        damage: 10,
        choices: [
            { text: "🏛️ Approach the temple", next: "temple_entrance" }
        ]
    },

    bridge_careful: {
        text: "Inch by inch, you make your way across. Two more planks give way, but your careful approach means you're always gripping the ropes tightly.\n\nYou reach the other side shaken but safe. The temple rises from the jungle ahead.",
        choices: [
            { text: "🏛️ Approach the temple", next: "temple_entrance" }
        ]
    },

    // --- Temple ---
    follow_prints: {
        text: "You follow the bootprints around the temple's perimeter. They lead to a collapsed section of wall where someone has clearly forced entry.\n\nInside, you find a makeshift camp — someone was here recently. Among the abandoned supplies, you find a sturdy rope and a journal.\n\nThe journal describes the temple's inner chambers and mentions a \"guardian\" that must be appeased, not fought.",
        gives: "rope",
        choices: [
            { text: "📖 Read more of the journal then enter", next: "temple_inner", gives: "journal_knowledge" },
            { text: "🚪 Enter the temple through the breach", next: "temple_inner" }
        ]
    },

    climb_temple: {
        text: "You scale the vine-covered exterior. Near the top, a loose stone gives way and you barely catch yourself!",
        damage: 15,
        choices: [
            { text: "⬆️ Keep climbing to the roof", next: "temple_roof" },
            { text: "⬇️ Climb back down and use the main entrance", next: "temple_entrance" }
        ]
    },

    temple_roof: {
        text: "From the roof, you find a hole where the ceiling has collapsed. Looking down, you can see a chamber with a faintly glowing pool of water.\n\nIt's a long drop, but there might be water deep enough to break your fall.",
        choices: [
            { text: "🪂 Jump down into the pool", next: "pool_chamber" },
            { text: "🔙 Find another way — climb back down", next: "temple_entrance" }
        ]
    },

    pool_chamber: {
        text: "You drop into the pool with a splash! The water is surprisingly warm and tinged with a golden glow. As you wade out, you feel revitalized — your scrapes and bruises fade.\n\nYou're in a sacred chamber deep within the temple.",
        damage: -30,
        choices: [
            { text: "🚪 Proceed through the only door", next: "trial_room" }
        ]
    },

    temple_entrance: {
        text: "You pass between the serpent statues and enter the temple. The air immediately turns cool and smells of ancient stone and dust.\n\nTorches on the walls flicker to life as you pass, as if the temple recognizes your presence. The corridor leads to a grand hall with three doorways, each marked with a different symbol:\n\n🧩 A labyrinth — the Trial of Wit\n🔥 A flame — the Trial of Courage\n💎 A cracked gem — the Trial of Sacrifice",
        choices: [
            { text: "🧩 Enter the Trial of Wit", next: "trial_wit" },
            { text: "🔥 Enter the Trial of Courage", next: "trial_courage" },
            { text: "💎 Enter the Trial of Sacrifice", next: "trial_sacrifice" }
        ]
    },

    temple_inner: {
        text: "Through the breach, you find yourself in a side corridor. It merges into the main hall where three doorways await, each marked with a symbol:\n\n🧩 A labyrinth — the Trial of Wit\n🔥 A flame — the Trial of Courage\n💎 A cracked gem — the Trial of Sacrifice",
        choices: [
            { text: "🧩 Enter the Trial of Wit", next: "trial_wit" },
            { text: "🔥 Enter the Trial of Courage", next: "trial_courage" },
            { text: "💎 Enter the Trial of Sacrifice", next: "trial_sacrifice" }
        ]
    },

    temple_back: {
        text: "The back passage leads you into a dimly lit corridor that connects directly to the inner sanctum area. You can hear water dripping and the hum of something ancient.\n\nYou arrive at the trial room from behind, bypassing the entrance hall entirely.",
        choices: [
            { text: "🚪 Enter the trial room", next: "trial_room" }
        ]
    },

    // --- Trials ---
    trial_wit: {
        text: "You enter a circular room. The door seals behind you. In the center, a stone sphinx speaks:\n\n\"I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. I have roads, but no cars drive there. What am I?\"\n\nThree pedestals rise from the floor, each with a word carved into it.",
        choices: [
            { text: "🗺️ \"A map\"", next: "trial_wit_correct" },
            { text: "🌍 \"The earth\"", next: "trial_wit_wrong" },
            { text: "💭 \"A dream\"", next: "trial_wit_wrong" }
        ]
    },

    trial_wit_correct: {
        text: "\"Correct,\" the sphinx says, its stone eyes glowing. \"You see the world not as it is, but as it is represented. Wisdom serves you well.\"\n\nThe far wall slides open, revealing a passage forward.",
        choices: [
            { text: "➡️ Proceed to the inner sanctum", next: "trial_room" }
        ]
    },

    trial_wit_wrong: {
        text: "\"Incorrect,\" the sphinx intones. The floor beneath you gives way slightly, and darts shoot from the walls! You dodge most of them, but one grazes your arm.\n\n\"The answer was 'a map.' You may still pass, but bear this wound as a reminder.\"",
        damage: 25,
        choices: [
            { text: "➡️ Proceed to the inner sanctum (wounded)", next: "trial_room" }
        ]
    },

    trial_courage: {
        text: "You enter a long hall. At the far end sits the exit. But the entire floor is a pit of glowing coals, and blades swing from the ceiling in rhythmic arcs.\n\nThere is no puzzle here — only the courage to walk through.",
        choices: [
            { text: "🏃 Sprint through as fast as possible", next: "courage_sprint" },
            { text: "🧘 Walk calmly and steadily, timing the blades", next: "courage_calm" },
            { text: "🔙 Turn back and choose a different trial", next: "temple_entrance" }
        ]
    },

    courage_sprint: {
        text: "You take a deep breath and charge! The coals sear your boots and a blade catches your shoulder, but your speed carries you through to the other side.\n\nBattered but alive, you've passed the Trial of Courage.",
        damage: 30,
        choices: [
            { text: "➡️ Proceed to the inner sanctum", next: "trial_room" }
        ]
    },

    courage_calm: {
        text: "You steady your breathing and walk. The coals burn, but you place each step deliberately. You watch the blades, finding their rhythm — step, pause, step, duck, step.\n\nYou emerge with only minor burns. The temple seems to hum with approval.",
        damage: 10,
        choices: [
            { text: "➡️ Proceed to the inner sanctum", next: "trial_room" }
        ]
    },

    trial_sacrifice: {
        text: "The chamber is empty except for a stone altar. A voice echoes:\n\n\"To pass, you must leave behind something of value. Place your offering upon the altar.\"",
        choices: [
            { text: "📿 Offer the jade amulet", next: "sacrifice_amulet", requires: "jade_amulet" },
            { text: "🧭 Offer the compass", next: "sacrifice_compass", requires: "compass" },
            { text: "❤️ Offer your own vitality", next: "sacrifice_health" },
            { text: "🔙 Turn back and choose a different trial", next: "temple_entrance" }
        ]
    },

    sacrifice_amulet: {
        text: "You place the jade amulet on the altar. It glows brilliantly, then dissolves into motes of green light that sink into the stone.\n\n\"A worthy offering. The serpent's circle is complete.\"\n\nThe wall opens to reveal the path forward.",
        choices: [
            { text: "➡️ Proceed to the inner sanctum", next: "trial_room" }
        ]
    },

    sacrifice_compass: {
        text: "You place the compass on the altar. The needle spins wildly, then stops. The compass cracks apart and a beam of light shoots into the ceiling.\n\n\"You give up your direction to find your destiny. Acceptable.\"\n\nA passage opens.",
        choices: [
            { text: "➡️ Proceed to the inner sanctum", next: "trial_room" }
        ]
    },

    sacrifice_health: {
        text: "With nothing else to offer, you press your palm against the altar. Pain shoots through your body as the stone draws your energy. You feel significantly weakened.\n\n\"The greatest sacrifice is of oneself. You may pass.\"",
        damage: 40,
        choices: [
            { text: "➡️ Proceed to the inner sanctum (weakened)", next: "trial_room" }
        ]
    },

    // --- Final Chamber ---
    trial_room: {
        text: "You enter the inner sanctum. The chamber is vast, with a domed ceiling painted with stars. In the center, on a crystal pedestal bathed in a shaft of light from above, sits the Star of Azmar — a diamond that pulses with inner fire.\n\nBut between you and the star stands a massive stone guardian — a serpent golem that uncoils and raises its head, eyes glowing red.\n\nIt hisses and lunges!",
        choices: [
            { text: "⚔️ Fight the guardian head-on", next: "fight_guardian" },
            { text: "🗣️ Try to communicate with it", next: "speak_guardian" },
            { text: "📖 Use knowledge from the journal", next: "appease_guardian", requires: "journal_knowledge" },
            { text: "📿 Hold up the jade amulet (serpent symbol)", next: "amulet_guardian", requires: "jade_amulet" }
        ]
    },

    fight_guardian: {
        text: "You dodge the guardian's strikes and fight back with everything you have. The battle is brutal — the stone serpent is enormously powerful.\n\nYou manage to crack its core, and it crumbles... but not before dealing you devastating blows.",
        damage: 50,
        choices: [
            { text: "💎 Claim the Star of Azmar", next: "claim_star_fight" }
        ]
    },

    speak_guardian: {
        text: "\"HALT!\" you shout. The guardian pauses, tilting its stone head.\n\nYou speak of your journey, the trials you've faced, and your respect for the temple. The guardian studies you for a long moment.\n\n\"Your words carry weight... but words alone are not enough.\" It strikes!",
        damage: 25,
        choices: [
            { text: "⚔️ Defend yourself!", next: "fight_guardian_partial" },
            { text: "🧘 Stand your ground without fighting", next: "stand_ground" }
        ]
    },

    fight_guardian_partial: {
        text: "You fight defensively, trying not to destroy the guardian but to survive. After what feels like an eternity, the guardian withdraws.\n\n\"You fight with restraint. This is... acceptable.\"\n\nIt coils around the pedestal and goes still.",
        damage: 15,
        choices: [
            { text: "💎 Carefully claim the Star of Azmar", next: "claim_star_peace" }
        ]
    },

    stand_ground: {
        text: "The guardian's strike stops inches from your face. You don't flinch.\n\n\"Courage without violence. The truest form of bravery.\"\n\nThe guardian bows its great stone head and slithers aside, clearing the path to the Star.",
        choices: [
            { text: "💎 Reverently claim the Star of Azmar", next: "claim_star_worthy" }
        ]
    },

    appease_guardian: {
        text: "Remembering the journal's advice, you kneel before the guardian and press your forehead to the stone floor.\n\n\"I come not to take, but to receive what I have earned through the trials.\"\n\nThe guardian studies you, then slowly bows in return. It slithers aside.\n\n\"One who has read the words of those who came before. You are prepared.\"",
        choices: [
            { text: "💎 Claim the Star of Azmar with gratitude", next: "claim_star_worthy" }
        ]
    },

    amulet_guardian: {
        text: "You hold up the jade amulet — the serpent eating its own tail. The guardian freezes, its red eyes shifting to green.\n\n\"The circle... you carry the old symbol. You are of the temple.\"\n\nThe guardian coils peacefully around the pedestal's base and goes dormant.",
        choices: [
            { text: "💎 Claim the Star of Azmar", next: "claim_star_worthy" }
        ]
    },

    // --- Endings ---
    claim_star_fight: {
        text: "You limp to the pedestal and grasp the Star of Azmar. It's warm in your hands, pulsing with ancient power.\n\nAs you hold it, the temple begins to rumble. Dust falls from the ceiling. The temple is collapsing!\n\nYou run, battered and bleeding, through crumbling corridors. You barely make it out as the temple collapses behind you into a cloud of dust.\n\nYou survived. You hold the Star. But at great cost.\n\n⭐ ENDING: The Pyrrhic Victory\nYou claimed the treasure, but the temple and its wonders are lost forever.",
        ending: true
    },

    claim_star_peace: {
        text: "You take the Star gently from its pedestal. The crystal hums and the room fills with warm golden light.\n\nThe temple groans but holds steady. A new passage opens — a clean, lit stairway leading up and out.\n\nYou emerge from the jungle temple into sunlight, the Star safe in your hands. Behind you, the temple stands — scarred from your passage but still whole.\n\n⭐ ENDING: The Respectful Explorer\nYou claimed the Star through a mix of courage and restraint. The temple endures for future seekers.",
        ending: true
    },

    claim_star_worthy: {
        text: "You lift the Star of Azmar from its pedestal. The moment your fingers touch it, the entire temple transforms.\n\nThe walls repair themselves. The ceiling's painted stars begin to glow like real constellations. The guardian rises, no longer menacing but regal, and bows once more.\n\nA voice fills the sanctum: \"The worthy one has come at last. The Star is yours — and with it, the knowledge of Azmar.\"\n\nVisions flood your mind — ancient wisdom, forgotten history, the secrets of the temple's builders. You walk out of the temple changed, the Star glowing gently in your hands.\n\n⭐ ENDING: The Worthy Heir\nYou didn't just find the Star — you earned the legacy of Azmar. The temple will endure eternally.",
        ending: true
    }
};

// --- Game State ---
let state = {
    health: 100,
    inventory: [],
    currentNode: "start",
    flags: new Set()
};

// --- DOM Elements ---
const storyText = document.getElementById("story-text");
const choicesPanel = document.getElementById("choices-panel");
const healthDisplay = document.getElementById("health-display");
const inventoryDisplay = document.getElementById("inventory-display");
const restartBtn = document.getElementById("restart-btn");

// --- Game Engine ---
function startGame() {
    state = {
        health: 100,
        inventory: [],
        currentNode: "start",
        flags: new Set()
    };
    restartBtn.style.display = "none";
    renderNode("start");
}

function renderNode(nodeId) {
    const node = story[nodeId];
    if (!node) {
        storyText.textContent = "Error: Story node not found!";
        return;
    }

    state.currentNode = nodeId;

    // Apply damage/healing
    if (node.damage) {
        state.health = Math.max(0, Math.min(100, state.health - node.damage));
    }

    // Apply item grants from the node itself
    if (node.gives) {
        if (!state.inventory.includes(node.gives)) {
            state.inventory.push(node.gives);
        }
        state.flags.add(node.gives);
    }

    // Check for death
    if (state.health <= 0) {
        renderDeath();
        return;
    }

    // Render story text with fade
    storyText.textContent = node.text;
    storyText.classList.remove("fade-in");
    void storyText.offsetWidth; // trigger reflow
    storyText.classList.add("fade-in");

    // Render choices or ending
    choicesPanel.innerHTML = "";

    if (node.ending) {
        restartBtn.style.display = "block";
    } else {
        node.choices.forEach(choice => {
            // Check if choice has a requirement
            if (choice.requires && !state.flags.has(choice.requires)) {
                return; // skip this choice
            }

            const btn = document.createElement("button");
            btn.className = "choice-btn fade-in";
            btn.textContent = choice.text;
            btn.addEventListener("click", () => {
                // Apply item grants from the choice
                if (choice.gives) {
                    if (!state.inventory.includes(choice.gives)) {
                        state.inventory.push(choice.gives);
                    }
                    state.flags.add(choice.gives);
                }
                renderNode(choice.next);
            });
            choicesPanel.appendChild(btn);
        });
    }

    updateStatus();
}

function renderDeath() {
    storyText.textContent = "Your vision blurs and your legs give way. The temple's ancient stone is cold against your cheek.\n\nThe jungle will reclaim you, as it has reclaimed so many before.\n\n💀 ENDING: Lost to the Jungle\nYou pushed too far and paid the ultimate price. The Star of Azmar remains unclaimed.";
    storyText.classList.remove("fade-in");
    void storyText.offsetWidth;
    storyText.classList.add("fade-in");
    choicesPanel.innerHTML = "";
    restartBtn.style.display = "block";
    updateStatus();
}

function updateStatus() {
    // Health display with visual indicator
    let healthIcon = "❤️";
    if (state.health <= 25) healthIcon = "🖤";
    else if (state.health <= 50) healthIcon = "💔";
    else if (state.health <= 75) healthIcon = "🧡";

    healthDisplay.textContent = `${healthIcon} Health: ${state.health}/100`;

    // Inventory display
    const itemNames = {
        compass: "🧭 Compass",
        jade_amulet: "📿 Jade Amulet",
        rope: "🪢 Rope",
        map_knowledge: "🗺️ Map Insight",
        ancient_knowledge: "📜 Ancient Lore",
        journal_knowledge: "📖 Journal Notes"
    };

    const items = state.inventory.map(i => itemNames[i] || i);
    inventoryDisplay.textContent = items.length > 0 ? `Items: ${items.join(" · ")}` : "No items";
}

// --- Event Listeners ---
restartBtn.addEventListener("click", startGame);

// --- Start ---
startGame();