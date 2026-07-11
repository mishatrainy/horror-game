let gameState = {
    player: { lvl: 1, hp: 100, maxHp: 100, mp: 50, maxMp: 50, inventory: [], hasShield: false },
    monster: { name: "Мутировавший Монстр", hp: 130, maxHp: 130 }, // ХП снижено до 150 для баланса!
    currentScene: "start"
};

const scenes = {
    start: {
        text: "...Ты просыпаешься в древнем замке магов. На полу лежит сверкающий Меч. Из глубины зала доносится грохот темного Мутировавшего Монстра...",
        bg: "url('start.jpg')", overlay: "", showOverlay: false,
        options: [
            { text: "⚔️ Взять волшебный Меч и пойти вперед", action: () => takeItem("Волшебный меч", "forest_choice") },
            { text: "🏃 Тсс.. Забрать со стены Плащ скрытности и сбежать", action: () => takeItem("Плащ скрытности", "forest_choice") }
        ]
    },
    forest_choice: {
        text: "Ты выходишь на опушку. Впереди развилка. Куда направишься в поисках приключений?",
        bg: "url('forest.jpg')", overlay: "", showOverlay: false,
        options: [
            { text: "🌲 Напрямик через чащу туманного Леса", action: () => changeScene("forest_explore") },
            { text: "🕳️ Спуститься в Кристальную Пещеру", action: () => changeScene("cave_explore") }
        ]
    },
    forest_explore: {
        text: "🌲 Ты углубляешься в Лес. На поляне стоит старинный кованый сундук. Что сделаешь?",
        bg: "url('forest_deep.jpg')", overlay: "", showOverlay: false,
        options: [
            { text: "🔍 Обыскать сундук (Там может быть редкий артефакт!)", action: () => searchChest() },
            { text: "🏃 Игнорировать сундук и напасть из засады! (Скрытная атака +40 урона)", action: () => ambushMonster("forest_deep.jpg") }
        ]
    },
    cave_explore: {
        text: "🕳️ Ты исследуешь Кристальную Пещеру. У алтаря лежит древний Свиток Высшей Маны! Что сделаешь?",
        bg: "url('cave_deep.jpg')", overlay: "", showOverlay: false,
        options: [
            { text: "📜 Изучить Свиток (НАВСЕГДА увеличит макс. ману на +25)", action: () => collectMana() },
            { text: "🏃 Опасно, напасть на монстра со спины! (Скрытная атака +40 урона)", action: () => ambushMonster("cave_deep.jpg") }
        ]
    },
    battle: {
        text: "⚠️ ФИНАЛЬНОЕ ИСПЫТАНИЕ! Перед тобой вырастает огромный МУТИРОВАВШИЙ МОНСТР! Он преграждает путь к выходу и грозно хрипит: 'Назови секретное слово магов!'",
        bg: "", overlay: "monster.jpg", showOverlay: true,
        options: [
            { text: "🗣️ Сказать кодовое слово: 'Defendo!' (Магический Щит)", action: () => checkPassword(), condition: () => !gameState.player.hasShield },
            { text: "⚔️ Атаковать мечом (Нужен Волшебный Меч)", action: () => attackMonster(), condition: () => hasItem("Волшебный меч") },
            { text: "👊 Использовать обычную атаку (Мало урона без меча)", action: () => punchMonster(), condition: () => !hasItem("Волшебный меч") },
            { text: "🔮 Заклинание 'Огненный Шар' (20 MP | Огромный урон)", action: () => castMagic(), condition: () => gameState.player.mp >= 20 },
            { text: "🩹 Использовать Эликсир Жизни (Восстановит 40 HP)", action: () => usePotion(), condition: () => hasItem("Эликсир жизни") },
            { text: "🏆 Выпить Святой Грааль (Полное исцеление HP и MP!)", action: () => useGrail(), condition: () => hasItem("Святой Грааль") }
        ]
    },
    victory: {
        text: "🏆 ПОБЕДА! Мутировавший Монстр повержен! Ты успешно прошел испытание, выбрался на свободу и стал Великим Архимагом!",
        bg: "", overlay: "victory.jpg", showOverlay: true,
        options: [{ text: "🔄 Сыграть еще раз", action: () => resetGame() }]
    },
    gameover: {
        text: "💀 ВЫ ПОГИБЛИ. Твои силы покинули тебя. Попробуй снова!",
        bg: "radial-gradient(circle, #10101a 0%, #000000 100%)", overlay: "gameover.jpg", showOverlay: true,
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
    
    if (gameState.player.hasShield) {
        document.getElementById("player-lvl").innerText += " (🛡️ АКТИВЕН ЩИТ)";
    }
    
    const invBox = document.getElementById("inv-box");
    invBox.innerText = gameState.player.inventory.length > 0 
        ? `🎒 Сумка артефактов: ${gameState.player.inventory.join(", ")}` 
        : "🎒 Сумка артефактов: Пусто";

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
            document.getElementById("monster-tag").innerText = "АРХИМАГ";
        } else if (gameState.currentScene === "gameover") {
            document.getElementById("monster-tag").innerText = "ОТДЫХ";
        } else {
            document.getElementById("monster-tag").innerText = `ЖИЗНЬ ВРАГА: ${gameState.monster.hp} HP`;
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
    updateUI(`Вы получили: ${itemName}`);
}

function hasItem(itemName) {
    return gameState.player.inventory.includes(itemName);
}

function searchChest() {
    let rand = Math.random();
    if (rand > 0.6) {
        gameState.player.inventory.push("Эликсир жизни");
        scenes.battle.text = `🤠 Удача! В сундуке лежал Эликсир жизни! Но из леса вышел... ` + scenes.battle.text;
        updateUI("Вы нашли Эликсир жизни в сундуке!");
    } else if (rand > 0.2) {
        gameState.player.inventory.push("Святой Грааль");
        scenes.battle.text = `🌟 Ты открыл потайное дно и нашел легендарный Святой Грааль! Но земля содрогнулась... ` + scenes.battle.text;
        updateUI("Вы нашли легендарный Святой Грааль!");
    } else {
        let trapDamage = 20;
        gameState.player.hp -= trapDamage;
        triggerBloodFlash();
        scenes.battle.text = `💥 Ловушка! Из сундука вырвалось облако магии и нанесло тебе ${trapDamage} урона! Навстречу идет... ` + scenes.battle.text;
        updateUI(`Ой! На сундуке было защитное заклинание! Потеряно ${trapDamage} HP.`);
    }
    
    if (gameState.player.hp <= 0) {
        gameState.player.hp = 0;
        changeScene("gameover");
    } else {
        scenes.battle.bg = "url('forest_deep.jpg')";
        changeScene("battle");
    }
}

function collectMana() {
    gameState.player.maxMp += 25;
    gameState.player.mp = gameState.player.maxMp;
    scenes.battle.text = `📜 Прекрасно! Твой максимальный запас маны увеличен до 75 MP! Но из темноты шагает... ` + scenes.battle.text;
    scenes.battle.bg = "url('cave_deep.jpg')";
    changeScene("battle");
    updateUI("Максимальный запас маны увеличен на +25!");
}

function ambushMonster(currentBg) {
    scenes.battle.bg = `url('${currentBg}')`; 
    gameState.monster.hp -= 40; 
    changeScene("battle");
    updateUI("💥 ТАКТИЧЕСКИЙ ХОД! Вы нанесли Монстру 40 урона со спины из засады! Твой ход.");
}

// ПОЧИНЕНО: Пароль теперь просто вешает щит и НЕ вызывает мгновенную атаку босса
function checkPassword() {
    gameState.player.hasShield = true;
    updateUI("🛡️ ВЫЗОВ ЩИТА! Вокруг тебя возник сверкающий защитный барьер! Твой ход продолжается, выбери тип атаки!");
}

function regenerateMana() {
    gameState.player.mp = Math.min(gameState.player.maxMp, gameState.player.mp + 5);
}

function attackMonster() {
    let damageToMonster = Math.floor(Math.random() * 16) + 15;
    if (Math.random() < 0.15) {
        damageToMonster *= 2;
        updateUI(`🔥 КРИТ! Меч рассекает броню монстра на ${damageToMonster} урона! (+5 MP восстановлено)`);
    } else {
        updateUI(`Ты атакуешь монстра волшебным мечом на ${damageToMonster} урона. (+5 MP восстановлено)`);
    }
    gameState.monster.hp -= damageToMonster;
    regenerateMana(); // Пассивная регенерация маны!

    if (gameState.monster.hp <= 0) {
        gameState.monster.hp = 0;
        changeScene("victory");
    } else {
        monsterCounterAttack();
    }
}

function punchMonster() {
    let punchDamage = Math.floor(Math.random() * 4) + 4;
    gameState.monster.hp -= punchDamage;
    updateUI(`👊 Ты бьешь монстра рукой на ${punchDamage} урона. (+5 MP восстановлено)`);
    regenerateMana(); // Пассивная регенерация маны!
    
    if (gameState.monster.hp <= 0) {
        gameState.monster.hp = 0;
        changeScene("victory");
    } else {
        monsterCounterAttack();
    }
}

function castMagic() {
    gameState.player.mp -= 20;
    if (Math.random() > 0.25) {
        let magicDamage = 45;
        gameState.monster.hp -= magicDamage;
        updateUI(`🔮 БУМ! Огненный Шар взрывается на монстре! Нанесено ${magicDamage} урона.`);
    } else {
        updateUI(`💨 Промах! Твой Огненный Шар улетел в стену!`);
    }
    
    if (gameState.monster.hp <= 0) {
        gameState.monster.hp = 0;
        changeScene("victory");
    } else {
        monsterCounterAttack();
    }
}

function usePotion() {
    const index = gameState.player.inventory.indexOf("Эликсир жизни");
    gameState.player.inventory.splice(index, 1);
    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + 40);
    updateUI("🩹 Вы выпили Эликсир и восстановили 40 HP!");
    monsterCounterAttack();
}

function useGrail() {
    const index = gameState.player.inventory.indexOf("Святой Грааль");
    gameState.player.inventory.splice(index, 1);
    gameState.player.hp = gameState.player.maxHp;
    gameState.player.mp = gameState.player.maxMp;
    updateUI("🌟 Мощь Святого Грааля полностью восстановила Здоровье и Ману!");
    monsterCounterAttack();
}

function monsterCounterAttack() {
    setTimeout(() => {
        if (gameState.monster.hp <= 0) return;
        
        // ПРОВЕРКА ПЛАЩА СКРЫТНОСТИ (25% шанс уклонения, если игрок выбрал побег в начале)
        if (hasItem("Плащ скрытности") && Math.random() < 0.25) {
            scenes.battle.text = `⚠️ БИТВА! У Монстра осталось [${gameState.monster.hp} HP]. Он яростно заносит лапу!`;
            updateUI(`💨 Уклонение! Благодаря Плащу скрытности ты растворился в воздухе и увернулся от атаки! Получено 0 урона.`);
            return;
        }

        // ПРОВЕРКА ИСПРАВЛЕННОГО МАГИЧЕСКОГО ЩИТА
        if (gameState.player.hasShield) {
            gameState.player.hasShield = false; // Ломаем щит
            scenes.battle.text = `⚠️ БИТВА! У Монстра осталось [${gameState.monster.hp} HP]. Он яростно заносит лапу!`;
            updateUI(`🛡️ ЩИТ СРАБОТАЛ! Магический барьер полностью поглотил удар! Получено 0 урона. Щит разрушен!`);
            return; 
        }
        
        let monsterDamage = Math.floor(Math.random() * 15) + 15; // Сбалансированный урон 15-30
        gameState.player.hp -= monsterDamage;
        triggerBloodFlash();
        
        if (gameState.player.hp <= 0) {
            gameState.player.hp = 0;
            changeScene("gameover");
        } else {
            scenes.battle.text = `⚠️ БИТВА! У Монстра осталось [${gameState.monster.hp} HP]. Он яростно заносит лапу!`;
            updateUI(`💥 Мутировавший Монстр бьет тебя на ${monsterDamage} урона! Твой ход.`);
        }
    }, 600);
}

function resetGame() {
    gameState = {
        player: { lvl: 1, hp: 100, maxHp: 100, mp: 50, maxMp: 50, inventory: [], hasShield: false },
        monster: { name: "Мутировавший Монстр", hp: 150, maxHp: 150 }
    };
    scenes.battle.text = "⚠️ ХАРДКОР-БИТВА! Из тьмы вылетает МУТИРОВАВШИЙ МОНСТР! Назови секретное слово!";
    changeScene("start");
}

changeScene("start");
