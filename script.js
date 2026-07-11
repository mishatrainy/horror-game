let gameState = {
    player: { lvl: 1, hp: 100, maxHp: 100, mp: 50, maxMp: 50, inventory: [] },
    monster: { name: "Dumpling", hp: 180, maxHp: 180 },
    currentScene: "start"
};

const scenes = {
    start: {
        text: "...Ты просыпаешься в сыром подвале. На полу лежит ржавый Меч. Из глубин доносится чавканье монстра Dumpling...",
        bg: "url('start.jpg')", 
        overlay: "", 
        showOverlay: false,
        options: [
            { text: "⚔️ Поднять ржавый Меч и пойти вперед", action: () => takeItem("Ржавый меч", "forest_choice") },
            { text: "🏃 Тсс.. Пройти мимо без оружия", action: () => changeScene("forest_choice") }
        ]
    },
    forest_choice: {
        text: "Ты вырываешься на поверхность. Впереди развилка. Куда побежишь, чтобы скрыться от погони монстра?",
        bg: "url('forest.jpg')", 
        overlay: "",
        showOverlay: false,
        options: [
            { text: "🌲 Напрямик через чащу туманного Леса", action: () => changeScene("forest_explore") },
            { text: "🕳️ Спрятаться в темной Пещере", action: () => changeScene("cave_explore") }
        ]
    },
    // УНИКАЛЬНЫЙ ФОН ГЛУБИНЫ ЛЕСА
    forest_explore: {
        text: "🌲 Ты углубляешься в Лес. Туман сгущается. На тропе ты видишь брошенный старый сундук. Что сделаешь?",
        bg: "url('forest_deep.jpg')", 
        overlay: "",
        showOverlay: false,
        options: [
            { text: "🔍 Рискнуть и обыскать старый сундук", action: () => searchChest("forest") },
            { text: "🏃 Игнорировать сундук и бежать дальше", action: () => changeScene("battle") }
        ]
    },
    // УНИКАЛЬНЫЙ ФОН ИЗУЧЕНИЯ ПЕЩЕРЫ
    cave_explore: {
        text: "🕳️ Ты бежишь по темной Пещере. Под ногами хрустят кости. Впереди у стены лежит светящийся Свиток маны. Твои действия?",
        bg: "url('cave_deep.jpg')", 
        overlay: "",
        showOverlay: false,
        options: [
            { text: "📜 Подобрать Свиток маны (+25 MP)", action: () => collectMana() },
            { text: "🏃 Опасно, бежать вглубь без остановок", action: () => changeScene("battle") }
        ]
    },
    battle: {
        text: "⚠️ ХАРДКОР-БИТВА! Из тьмы с диким ревом вылетает МУТИРОВАВШИЙ DUMPLING! Его глаза горят огнем, он блокирует выход и хрипит: 'What's your hobby?'",
        bg: "", // Магия слоев: фон леса или пещеры зафиксируется из функции triggerEncounter!
        overlay: "monster.jpg", 
        showOverlay: true,
        options: [
            { text: "🗣️ Крикнуть пароль: 'Ikillpigs!' (Шанс 50% разозлить босса)", action: () => checkPassword() },
            { text: "⚔️ Рубить мечом (Нужен ржавый Меч)", action: () => attackMonster(), condition: () => hasItem("Ржавый меч") },
            { text: "👊 Бить кулаками (Безумие! Мало урона)", action: () => punchMonster(), condition: () => !hasItem("Ржавый меч") },
            { text: "🔮 Огненный шар (15 MP | Высокий урон)", action: () => castMagic(), condition: () => gameState.player.mp >= 15 },
            { text: "🩹 Выпить зелье здоровья (Восстановит 40 HP)", action: () => usePotion(), condition: () => hasItem("Зелье здоровья") }
        ]
    },
    victory: {
        text: "🏆 ТРИУМФ! Проклятый Dumpling повержен и превратился в пельменный фарш! Вы выжили в этом хардкоре и вырвались на свободу. Ты — легенда кодинга!",
        bg: "", 
        overlay: "victory.jpg", 
        showOverlay: true,
        options: [{ text: "🔄 Начать заново", action: () => resetGame() }]
    },
    gameover: {
        text: "💀 ВЫ ПОГИБЛИ. Твои кости остались гнить в  катакомбах. Dumpling пирует твоей плотью... Попробуй еще раз, если хватит духа.",
        bg: "radial-gradient(circle, #000 0%, #000 100%)", 
        overlay: "gameover.jpg", 
        showOverlay: true,
        options: [{ text: "🔄 Возродиться у костра", action: () => resetGame() }]
    }
};

function updateUI(logMessage = "") {
    document.getElementById("hp-text").innerText = `${gameState.player.hp}/${gameState.player.maxHp}`;
    document.getElementById("hp-bar").style.width = `${(gameState.player.hp / gameState.player.maxHp) * 100}%`;
    
    document.getElementById("mp-text").innerText = `${gameState.player.mp}/${gameState.player.maxMp}`;
    document.getElementById("mp-bar").style.width = `${(gameState.player.mp / gameState.player.maxMp) * 100}%`;
    
    document.getElementById("player-lvl").innerText = `LVL: ${gameState.player.lvl}`;
    document.getElementById("log-box").innerText = logMessage;
    
    const invBox = document.getElementById("inv-box");
    invBox.innerText = gameState.player.inventory.length > 0 
        ? `🎒 Рюкзак: ${gameState.player.inventory.join(", ")}` 
        : "🎒 Рюкзак: Пусто";

    const btnBox = document.getElementById("btn-box");
    btnBox.innerHTML = "";
    
    const currentSceneData = scenes[gameState.currentScene];
    document.getElementById("story-box").innerHTML = currentSceneData.text;
    
    if (currentSceneData.bg !== "") {
        document.getElementById("screen").style.background = currentSceneData.bg;
    }
    
    const charLayer = document.getElementById("character-layer");
    if (currentSceneData.showOverlay) {
        charLayer.style.display = "flex";
        document.getElementById("monster-img").src = currentSceneData.overlay;
        
        if (gameState.currentScene === "victory") {
            document.getElementById("monster-tag").innerText = "ПОБЕДИТЕЛЬ";
        } else if (gameState.currentScene === "gameover") {
            document.getElementById("monster-tag").innerText = "МЕРТВ";
        } else {
            document.getElementById("monster-tag").innerText = "БОСС: DUMPLING";
        }
    } else {
        charLayer.style.display = "none";
    }

    currentSceneData.options.forEach(opt => {
        if (!opt.condition || opt.condition()) {
            const btn = document.createElement("button");
            btn.innerHTML = opt.text;
            btn.onclick = opt.action;
            btnBox.appendChild(btn);
        }
    });
}

function triggerBloodFlash() {
    const screen = document.getElementById("screen");
    screen.classList.add("flash-blood");
    setTimeout(() => screen.classList.remove("flash-blood"), 300);
}

function changeScene(sceneName) {
    gameState.currentScene = sceneName;
    updateUI();
}

function takeItem(itemName, nextScene) {
    gameState.player.inventory.push(itemName);
    changeScene(nextScene);
    updateUI(`Вы подобрали: ${itemName}`);
}

function hasItem(itemName) {
    return gameState.player.inventory.includes(itemName);
}

function searchChest(location) {
    if (Math.random() > 0.5) {
        gameState.player.inventory.push("Зелье здоровья");
        scenes.battle.text = `🤠 Удача! В сундуке лежало Зелье здоровья! Но сзади раздался рев... ` + scenes.battle.text;
        updateUI("Вы нашли Зелье здоровья в сундуке!");
    } else {
        let trapDamage = 25;
        gameState.player.hp -= trapDamage;
        triggerBloodFlash();
        scenes.battle.text = `💥 Ловушка! Из сундука вылетела стрела и нанесла тебе ${trapDamage} урона! На рану бежит... ` + scenes.battle.text;
        updateUI(`Черт! Сундук был заминирован! Получено ${trapDamage} урона.`);
    }
    
    if (gameState.player.hp <= 0) {
        gameState.player.hp = 0;
        changeScene("gameover");
    } else {
        // Логика фиксации фона: битва сохранит фон дремучего леса
        scenes.battle.bg = "url('forest_deep.jpg')";
        changeScene("battle");
    }
}

function collectMana() {
    gameState.player.mp = Math.min(gameState.player.maxMp, gameState.player.mp + 25);
    scenes.battle.text = `📜 Вы прочитали свиток и восстановили 25 MP! Но стены пещеры рушатся... ` + scenes.battle.text;
    // Логика фиксации фона: битва сохранит фон заброшенной пещеры
    scenes.battle.bg = "url('cave_deep.jpg')";
    changeScene("battle");
    updateUI("Вы впитали энергию свитка маны!");
}

function checkPassword() {
    if (Math.random() > 0.5) {
        scenes.victory.text = `🗣 Ты крикнул "Ikillpigs!". Dumpling замер, испугался твоей безумной ухмылки и сбежал! ` + scenes.victory.text;
        gameState.player.lvl += 1;
        changeScene("victory");
    } else {
        updateUI("👹 Dumpling взревел: 'Ты убиваешь свиней?! Я ОБОЖАЮ СВИНЕЙ! УМРИ!' Пароль разозлил босса!");
        monsterCounterAttack(true);
    }
}

function attackMonster() {
    let damageToMonster = Math.floor(Math.random() * 21) + 15;
    
    if (Math.random() < 0.15) {
        damageToMonster *= 2;
        updateUI(`🔥 КРИТ! Меч рассекает плоть Dumpling на ${damageToMonster} урона!`);
    } else {
        updateUI(`Ты бьешь монстра мечом на ${damageToMonster} урона.`);
    }
    gameState.monster.hp -= damageToMonster;

    if (gameState.monster.hp <= 0) {
        changeScene("victory");
    } else {
        monsterCounterAttack();
    }
}

function punchMonster() {
    let punchDamage = Math.floor(Math.random() * 6) + 5;
    gameState.monster.hp -= punchDamage;
    updateUI(`👊 Безумие! Ты бьешь огромного монстра кулаком на ${punchDamage} урона! Это его только смешит.`);
    
    if (gameState.monster.hp <= 0) {
        changeScene("victory");
    } else {
        monsterCounterAttack();
    }
}

function castMagic() {
    gameState.player.mp -= 15;
    
    if (Math.random() > 0.3) {
        let magicDamage = 50;
        gameState.monster.hp -= magicDamage;
        updateUI(`🔮 Огненный Шар взрывает Dumpling на ${magicDamage} урона!`);
    } else {
        updateUI(`💨 Промах! Твой огненный шар пролетел мимо цели и врезался в стену!`);
    }
    
    if (gameState.monster.hp <= 0) {
        changeScene("victory");
    } else {
        monsterCounterAttack();
    }
}

function usePotion() {
    const index = gameState.player.inventory.indexOf("Зелье здоровья");
    gameState.player.inventory.splice(index, 1);
    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + 40);
}
function usePotion() {
    const index = gameState.player.inventory.indexOf("Зелье здоровья");
    gameState.player.inventory.splice(index, 1);
    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + 40);
    updateUI("🩹 Восстановлено 40 HP!");
    monsterCounterAttack();
}

function monsterCounterAttack(isEnraged = false) {
    setTimeout(() => {
        if (gameState.monster.hp <= 0) return;
        
        let monsterDamage = Math.floor(Math.random() * 21) + 20;
        if (isEnraged) monsterDamage += 15;
        
        gameState.player.hp -= monsterDamage;
        triggerBloodFlash();
        
        if (gameState.player.hp <= 0) {
            gameState.player.hp = 0;
            changeScene("gameover");
        } else {
            scenes.battle.text = `⚠️ БИТВА! У Dumpling осталось [${gameState.monster.hp} HP]. Он заносит огромную лапу!`;
            updateUI(`🩸 Dumpling разорвал тебя на ${monsterDamage} урона! Твой ход. Ты на грани смерти!`);
        }
    }, 600);
}

function resetGame() {
    gameState = {
        player: { lvl: 1, hp: 100, maxHp: 100, mp: 50, maxMp: 50, inventory: [] },
        monster: { name: "Dumpling", hp: 180, maxHp: 180 },
        currentScene: "start"
    };
    document.getElementById("monster-tag").innerText = "БОСС: DUMPLING";
    scenes.battle.text = "⚠️ ХАРДКОР-БИТВА! Из тьмы с диким ревом вылетает МУТИРОВАВШИЙ DUMPLING! Его глаза горят огнем, он блокирует выход и хрипит: 'What's your hobby?'";
    changeScene("start");
}

// САМЫЙ ПЕРВЫЙ ЗАПУСК ИГРЫ
changeScene("start");
