from Falcom.ED85.Parser.scena_writer_helper import *

# Currently only outputs all enemy CP values.
DEBUG_MESSAGES = True
# Some parts of the Debug Menu require Reverie Script Extender (and Modified Decompiler2). (opcode tracing menu)
DEBUG_MENU = True
# ENEMY_SBREAK requires Reverie Script Extender (and Modified Decompiler2) to work.
ENEMY_SBREAK = True
# Helper functions to manupulate chr stats (HP etc) (includes BP, AG)
BTL_CHANGE_UNIT = True

# Requires bgmId_table Metadata.
PLAY_BGM_MENU = True
# Requires itemId_table Metadata.
ITEM_MENU = True

DIFF_MOD_MENU = True

# Notes:
# Nested menus can only be 4 layers deep, have to replace menus using same menuLevel/menuVar instead.

# Functions to replace
def funcCallBack(name: str, f: Callable):
    match name:
        case _: pass

    pass

# Functions to add
def runCallBack(g):
    from Falcom.ED85.Parser.scena_writer import _gScena as scena

    # Merge face.dat functions to debug.dat
    try:
        import face
        scena = createScenaWriter('debug.dat')
    except ModuleNotFoundError:
        print("face.dat not found. If using debug.dat, face will not be working.")

    if DEBUG_MENU:
        scena.Code('FC_ActMenu_MOD')(FC_ActMenu_MOD)
    if ENEMY_SBREAK:
        for f in [
            # AniBtlEnemySBreak, # No longer used.
            SBreak_Enemy,
            SBreak_Enemy_Finish,
            SBreak_Enemy_Maintain,
            SBreak_Enemy_Effect,
        ]:
            scena.Code(f.__name__)(f)
    if BTL_CHANGE_UNIT:
        for f in [
            BtlChangeUnitChrStatus,
            BtlChangeBP,
            BtlChangeAG,
        ]:
            scena.Code(f.__name__)(f)

    for f in [
        OpenCampMenu,
    ]:
        scena.Code(f.__name__)(f)

def _init():
    from Falcom.ED85.Parser.scena_writer import _gScena as scena
    # scena.registerFuncCallback(funcCallBack)
    scena.registerRunCallback(runCallBack)

_init()

# Helper wrapper function
def wrapper(f, *args, **kwargs):
    return lambda: f(*args, **kwargs)

# Generate and return Python list [chrId, chrName] (sorted by chrId) for playable characters from chrId_table Metadata.
def getPartyList():
    from Falcom.ED85.Metadata.chrId_table import chrIdTable

    chrList = []

    for chrId, chrName in chrIdTable.items():
        if not isinstance(chrId, int):
            continue

        if chrId <= 0x40:   
            chrList.append((chrId, chrName))

    return sorted(chrList, key = lambda e: e[0])

# Generate and return Python list [itemId, itemName] (t_magic order) for items from itemId_table Metadata.
def getItemList():
    from Falcom.ED85.Metadata.itemId_table import itemIdTable

    itemList = []

    for itemId, itemName in itemIdTable.items():
        if not isinstance(itemId, int):
            continue

        itemList.append((itemId, itemName))

    return itemList

# Generate and return Python list [bgmId, bgmName] (sorted by bgmId) for BGMs from bgmId_table Metadata.
def getBGMList():
    from Falcom.ED85.Metadata.bgmId_table import bgmIdTable

    bgmList = []

    for bgmId, bgmName in bgmIdTable.items():
        if not isinstance(bgmId, int):
            continue

        bgmList.append((bgmId, bgmName))

    return sorted(bgmList, key = lambda e: e[1])

# Debug menu with functions from vanilla debug.dat
def DebugMenu(menuVar):
    OP_23(0x05, 0xFFFF, 100, 0xFFFF, 0xFFFF, 0x00)

    Talk(
        0xFFFF,
        (
            0xB,
            TxtCtl.ShowAll,
            f'Menu with functions from vanilla debug.dat\n',
            # TxtCtl.Enter,
        ),
    )

    ShowMenu(
        menuVar,
        1,
        ('SelectArea',          lambda: Call(ScriptId.Debug, 'SelectArea')),
        ('SelectFlag_System',   lambda: Call(ScriptId.Debug, 'SelectFlag_System')),
        ('SelectFlag',          lambda: Call(ScriptId.Debug, 'SelectFlag')),
        ('Mg01_Parts (Fishing)',          lambda: Call(ScriptId.Debug, 'Mg01_Parts')),
        fontSize = 33.0,
    )

    OP_25(0x00)
    OP_25(0x01)
    OP_23(0x05, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0x00)

# Custom Menus

def bgmMenu(menuVar):
    def playBGM(id: int):
        PlayBGM(id, 1.0, 0x0000, 0x00000000, 0x00)

    def playBGM1():
        items = []
        for bgmId, bgmName in getBGMList()[:100]:
            items.append((
                f'{"File: "+ bgmName + ", BGM ID: " + str(bgmId)}', wrapper(playBGM, bgmId),
            ))

        ShowMenu(
            menuVar+1,
            2,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    def playBGM2():
        items = []
        for bgmId, bgmName in getBGMList()[100:200]:
            items.append((
                f'{"File: "+ bgmName + ", BGM ID: " + str(bgmId)}', wrapper(playBGM, bgmId),
            ))

        ShowMenu(
            menuVar+1,
            2,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    def playBGM3():
        items = []
        for bgmId, bgmName in getBGMList()[200:300]:
            items.append((
                f'{"File: "+ bgmName + ", BGM ID: " + str(bgmId)}', wrapper(playBGM, bgmId),
            ))

        ShowMenu(
            menuVar+1,
            2,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    def playBGM4():
        items = []
        for bgmId, bgmName in getBGMList()[300:400]:
            items.append((
                f'{"File: "+ bgmName + ", BGM ID: " + str(bgmId)}', wrapper(playBGM, bgmId),
            ))

        ShowMenu(
            menuVar+1,
            2,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    def playBGM5():
        items = []
        for bgmId, bgmName in getBGMList()[400:]:
            items.append((
                f'{"File: "+ bgmName + ", BGM ID: " + str(bgmId)}', wrapper(playBGM, bgmId),
            ))

        ShowMenu(
            menuVar+1,
            2,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    ShowMenu(
        menuVar,
        1,
        ("bgm1-100", playBGM1),
        ("bgm101-200", playBGM2),
        ("bgm201-300", playBGM3),
        ("bgm301-400", playBGM4),
        ("bgm401...", playBGM5),
        fontSize=33.0,
    )

def itemMenu(menuVar):
    # AddItem opcode named wrong. rename.

    # OP_70(0x01, 0xFFFF, 0xFF) #Unequip gear.
    # OP_70(0x0C, 0xFFFF, 0xFF, 0x01) #Unequip orbments?
    # OP_70(0x0C, 0xFFFF, 0x00, 0x01) #Clear Sub master quartz. needs sleep?
    # OP_70(0x0C, 0xFFFF, 0x01, 0x01) #Clear main master quartz?

    # AddItem(0x03, ItemTable['Tear Balm'], 0) #Removes all items? 0x0C

    def addItem(itemId: int, howMany: int):
        AddItem(0x00, itemId, howMany)

    def subItem(itemId: int, howMany: int):
        AddItem(0x01, itemId, howMany)

    def itemSubMenu(itemId: int, menuLevel: int):
        optionsList = [
            ('Add x1', wrapper(addItem, itemId, 1)),
            ('Add x3', wrapper(addItem, itemId, 3)),
            ('Add x10', wrapper(addItem, itemId, 10)),
            ('Sub x1', wrapper(subItem, itemId, 1)),
            ('Sub x3', wrapper(subItem, itemId, 3)),
            ('Sub x10', wrapper(subItem, itemId, 10))
        ]
        ShowMenu(
            menuVar+(menuLevel-1),
            menuLevel,
            *optionsList,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    def addItemMulti(itemListStartIndex: int, itemListEndIndex: int, howMany: int):
        for itemId, _ in itemList[itemListStartIndex:itemListEndIndex]:
            AddItem(0x00, itemId, howMany)

    def subItemMulti(itemListStartIndex: int, itemListEndIndex: int, howMany: int):
        for itemId, _ in itemList[itemListStartIndex:itemListEndIndex]:
            AddItem(0x01, itemId, howMany)

    def itemSubMenuMulti(itemListStartIndex: int, itemListEndIndex: int, menuLevel: int):
        optionsList = [
            ('Add x1', wrapper(addItemMulti, itemListStartIndex, itemListEndIndex, 1)),
            ('Add x3', wrapper(addItemMulti, itemListStartIndex, itemListEndIndex, 3)),
            ('Add x10', wrapper(addItemMulti, itemListStartIndex, itemListEndIndex, 10)),
            ('Sub x1', wrapper(subItemMulti, itemListStartIndex, itemListEndIndex, 1)),
            ('Sub x3', wrapper(subItemMulti, itemListStartIndex, itemListEndIndex, 3)),
            ('Sub x10', wrapper(subItemMulti, itemListStartIndex, itemListEndIndex, 10))
        ]
        ShowMenu(
            menuVar+(menuLevel-1),
            menuLevel,
            *optionsList,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    itemList = getItemList()

    def itemMenu(itemListStartIndex: int, itemListEndIndex: int, menuLevel: int):
        items = []
        for itemId, itemName in itemList[itemListStartIndex:itemListEndIndex]:
            items.append((f"Name: {itemName}, ID: {str(itemId)} / {hex(itemId)}", wrapper(itemSubMenu, itemId, (menuLevel+1)),))

        items.append((f"All items in current menu", wrapper(itemSubMenuMulti, itemListStartIndex, itemListEndIndex, (menuLevel+1))))

        ShowMenu(
            menuVar+(menuLevel-1),
            menuLevel,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    def weaponsMenu(menuLevel: int):
        # Character list is in order from t_magic, not from chr metadata.
        items = [('Rean', wrapper(itemMenu, 196, 205, menuLevel)),
                 ('Juna', wrapper(itemMenu, 205, 214, menuLevel)),
                 ('Kurt', wrapper(itemMenu, 214, 223, menuLevel)),
                 ('Altina', wrapper(itemMenu, 223, 232, menuLevel)),
                 ('Musse', wrapper(itemMenu, 232, 241, menuLevel)),
                 ('Ash', wrapper(itemMenu, 241, 250, menuLevel)),
                 ('Alisa', wrapper(itemMenu, 250, 257, menuLevel)),
                 ('Elliot', wrapper(itemMenu, 257, 266, menuLevel)),
                 ('Laura', wrapper(itemMenu, 266, 273, menuLevel)),
                 ('Machias', wrapper(itemMenu, 273, 280, menuLevel)),
                 ('Emma', wrapper(itemMenu, 280, 287, menuLevel)),
                 ('Jusis', wrapper(itemMenu, 287, 296, menuLevel)),
                 ('Fie', wrapper(itemMenu, 296, 303, menuLevel)),
                 ('Gaius', wrapper(itemMenu, 303, 310, menuLevel)),
                 ('Millium', wrapper(itemMenu, 310, 319, menuLevel)),
                 ('Sara', wrapper(itemMenu, 319, 326, menuLevel)),
                 ('Crow', wrapper(itemMenu, 326, 333, menuLevel)),
                 ('Lloyd', wrapper(itemMenu, 333, 342, menuLevel)),
                 ('Elie', wrapper(itemMenu, 342, 351, menuLevel)),
                 ('Tio', wrapper(itemMenu, 351, 360, menuLevel)),
                 ('Randy', wrapper(itemMenu, 360, 369, menuLevel)),
                 ('Noel', wrapper(itemMenu, 369, 378, menuLevel)),
                 ('Wazy', wrapper(itemMenu, 378, 387, menuLevel)),
                 ('Rixia', wrapper(itemMenu, 387, 396, menuLevel)),
                 ('Rufus', wrapper(itemMenu, 396, 403, menuLevel)),
                 ('Lapis', wrapper(itemMenu, 403, 410, menuLevel)),
                 ('Swin', wrapper(itemMenu, 410, 417, menuLevel)),
                 ('Nadia', wrapper(itemMenu, 417, 424, menuLevel)),
                 ('Elise', wrapper(itemMenu, 424, 433, menuLevel)),
                 ('Alfin', wrapper(itemMenu, 433, 440, menuLevel)),
                 ('Olivier', wrapper(itemMenu, 440, 448, menuLevel)),
                 ('Towa', wrapper(itemMenu, 448, 454, menuLevel)),
                 ('Angelica', wrapper(itemMenu, 454, 461, menuLevel)),
                 ('George', wrapper(itemMenu, 461, 468, menuLevel)),
                 ('Sharon', wrapper(itemMenu, 468, 475, menuLevel)),
                 ('Claire', wrapper(itemMenu, 475, 484, menuLevel)),
                 ('Lechter', wrapper(itemMenu, 484, 493, menuLevel)),
                 ('Toval', wrapper(itemMenu, 493, 500, menuLevel)),
                 ('Victor', wrapper(itemMenu, 500, 507, menuLevel)),
                 ('Aurelia', wrapper(itemMenu, 507, 514, menuLevel)),
                 ('Duvalie', wrapper(itemMenu, 514, 521, menuLevel)),
                 ('Celine', wrapper(itemMenu, 521, 528, menuLevel)),
                 ('Roselia', wrapper(itemMenu, 528, 535, menuLevel)),
                 ('Vita', wrapper(itemMenu, 535, 542, menuLevel)),
                 ('Estelle', wrapper(itemMenu, 542, 549, menuLevel)),
                 ('Joshua', wrapper(itemMenu, 549, 556, menuLevel)),
                 ('Renne', wrapper(itemMenu, 556, 563, menuLevel)),
                 ('Tita', wrapper(itemMenu, 563, 570, menuLevel)),
                 ('Agate', wrapper(itemMenu, 570, 577, menuLevel)),
                 ('Arios', wrapper(itemMenu, 577, 584, menuLevel)),
                 ('McBurn', wrapper(itemMenu, 584, 585, menuLevel)),
                 ('Other', wrapper(itemMenu, 585, 599, menuLevel)),
                 ('Other2', wrapper(itemMenu, 599, 607, menuLevel)),
                 ('All Weapons', wrapper(itemSubMenuMulti, 196, 607, menuLevel+1)),
                 ]

        ShowMenu(
            menuVar+(menuLevel-1),
            menuLevel,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    def armorMenu(menuLevel: int):
        # Character list is in order from t_magic, not from chr metadata.
        items = [('Other', wrapper(itemMenu, 607, 629, menuLevel)),
                 ('Other2', wrapper(itemMenu, 629, 653, menuLevel)),
                 ('Rean', wrapper(itemMenu, 653, 662, menuLevel)),
                 ('Juna', wrapper(itemMenu, 662, 671, menuLevel)),
                 ('Kurt', wrapper(itemMenu, 671, 680, menuLevel)),
                 ('Altina', wrapper(itemMenu, 680, 689, menuLevel)),
                 ('Musse', wrapper(itemMenu, 689, 698, menuLevel)),
                 ('Ash', wrapper(itemMenu, 698, 707, menuLevel)),
                 ('Alisa', wrapper(itemMenu, 707, 716, menuLevel)),
                 ('Elliot', wrapper(itemMenu, 716, 725, menuLevel)),
                 ('Laura', wrapper(itemMenu, 725, 734, menuLevel)),
                 ('Machias', wrapper(itemMenu, 734, 743, menuLevel)),
                 ('Emma', wrapper(itemMenu, 743, 752, menuLevel)),
                 ('Jusis', wrapper(itemMenu, 752, 761, menuLevel)),
                 ('Fie', wrapper(itemMenu, 761, 770, menuLevel)),
                 ('Gaius', wrapper(itemMenu, 770, 779, menuLevel)),
                 ('Millium', wrapper(itemMenu, 779, 788, menuLevel)),
                 ('Sara', wrapper(itemMenu, 788, 797, menuLevel)),
                 ('Crow', wrapper(itemMenu, 797, 806, menuLevel)),
                 ('Lloyd', wrapper(itemMenu, 806, 815, menuLevel)),
                 ('Elie', wrapper(itemMenu, 815, 824, menuLevel)),
                 ('Tio', wrapper(itemMenu, 824, 833, menuLevel)),
                 ('Randy', wrapper(itemMenu, 833, 842, menuLevel)),
                 ('Noel', wrapper(itemMenu, 842, 851, menuLevel)),
                 ('Wazy', wrapper(itemMenu, 851, 860, menuLevel)),
                 ('Rixia', wrapper(itemMenu, 860, 869, menuLevel)),
                 ('Rufus', wrapper(itemMenu, 869, 878, menuLevel)),
                 ('Lapis', wrapper(itemMenu, 878, 887, menuLevel)),
                 ('Swin', wrapper(itemMenu, 887, 896, menuLevel)),
                 ('Nadia', wrapper(itemMenu, 896, 905, menuLevel)),
                 ('Elise', wrapper(itemMenu, 905, 914, menuLevel)),
                 ('Alfin', wrapper(itemMenu, 914, 923, menuLevel)),
                 ('Olivier', wrapper(itemMenu, 923, 932, menuLevel)),
                 ('Towa', wrapper(itemMenu, 932, 941, menuLevel)),
                 ('Angelica', wrapper(itemMenu, 941, 950, menuLevel)),
                 ('George', wrapper(itemMenu, 950, 959, menuLevel)),
                 ('Sharon', wrapper(itemMenu, 959, 968, menuLevel)),
                 ('Claire', wrapper(itemMenu, 968, 977, menuLevel)),
                 ('Lechter', wrapper(itemMenu, 977, 988, menuLevel)),
                 ('Toval', wrapper(itemMenu, 988, 995, menuLevel)),
                 ('Victor', wrapper(itemMenu, 995, 1004, menuLevel)),
                 ('Aurelia', wrapper(itemMenu, 1004, 1013, menuLevel)),
                 ('Duvalie', wrapper(itemMenu, 1013, 1022, menuLevel)),
                 ('Celine', wrapper(itemMenu, 1022, 1031, menuLevel)),
                 ('Roselia', wrapper(itemMenu, 1031, 1040, menuLevel)),
                 ('Vita', wrapper(itemMenu, 1040, 1049, menuLevel)),
                 ('Estelle', wrapper(itemMenu, 1049, 1058, menuLevel)),
                 ('Joshua', wrapper(itemMenu, 1058, 1067, menuLevel)),
                 ('Renne', wrapper(itemMenu, 1067, 1076, menuLevel)),
                 ('Tita', wrapper(itemMenu, 1076, 1085, menuLevel)),
                 ('Agate', wrapper(itemMenu, 1085, 1094, menuLevel)),
                 ('Arios', wrapper(itemMenu, 1094, 1103, menuLevel)),
                 ('McBurn', wrapper(itemMenu, 1103, 1106, menuLevel)),
                 ('All Body Armors', wrapper(itemSubMenuMulti, 607, 1106, menuLevel+1)),
                 ]

        ShowMenu(
            menuVar+(menuLevel-1),
            menuLevel,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    def bootsMenu(menuLevel: int):
        # Character list is in order from t_magic, not from chr metadata.
        items = [('Rean', wrapper(itemMenu, 1106, 1115, menuLevel)),
                 ('Juna', wrapper(itemMenu, 1115, 1124, menuLevel)),
                 ('Kurt', wrapper(itemMenu, 1124, 1133, menuLevel)),
                 ('Altina', wrapper(itemMenu, 1133, 1142, menuLevel)),
                 ('Musse', wrapper(itemMenu, 1142, 1151, menuLevel)),
                 ('Ash', wrapper(itemMenu, 1151, 1160, menuLevel)),
                 ('Alisa', wrapper(itemMenu, 1160, 1169, menuLevel)),
                 ('Elliot', wrapper(itemMenu, 1169, 1178, menuLevel)),
                 ('Laura', wrapper(itemMenu, 1178, 1187, menuLevel)),
                 ('Machias', wrapper(itemMenu, 1187, 1196, menuLevel)),
                 ('Emma', wrapper(itemMenu, 1196, 1205, menuLevel)),
                 ('Jusis', wrapper(itemMenu, 1205, 1214, menuLevel)),
                 ('Fie', wrapper(itemMenu, 1214, 1223, menuLevel)),
                 ('Gaius', wrapper(itemMenu, 1223, 1232, menuLevel)),
                 ('Millium', wrapper(itemMenu, 1232, 1241, menuLevel)),
                 ('Sara', wrapper(itemMenu, 1241, 1250, menuLevel)),
                 ('Crow', wrapper(itemMenu, 1250, 1259, menuLevel)),
                 ('Lloyd', wrapper(itemMenu, 1259, 1268, menuLevel)),
                 ('Elie', wrapper(itemMenu, 1268, 1277, menuLevel)),
                 ('Tio', wrapper(itemMenu, 1277, 1286, menuLevel)),
                 ('Randy', wrapper(itemMenu, 1286, 1295, menuLevel)),
                 ('Noel', wrapper(itemMenu, 1295, 1304, menuLevel)),
                 ('Wazy', wrapper(itemMenu, 1304, 1313, menuLevel)),
                 ('Rixia', wrapper(itemMenu, 1313, 1322, menuLevel)),
                 ('Rufus', wrapper(itemMenu, 1322, 1331, menuLevel)),
                 ('Lapis', wrapper(itemMenu, 1331, 1340, menuLevel)),
                 ('Swin', wrapper(itemMenu, 1340, 1349, menuLevel)),
                 ('Nadia', wrapper(itemMenu, 1349, 1358, menuLevel)),
                 ('Elise', wrapper(itemMenu, 1358, 1367, menuLevel)),
                 ('Alfin', wrapper(itemMenu, 1367, 1376, menuLevel)),
                 ('Olivier', wrapper(itemMenu, 1376, 1385, menuLevel)),
                 ('Towa', wrapper(itemMenu, 1385, 1394, menuLevel)),
                 ('Angelica', wrapper(itemMenu, 1394, 1403, menuLevel)),
                 ('George', wrapper(itemMenu, 1403, 1412, menuLevel)),
                 ('Sharon', wrapper(itemMenu, 1412, 1421, menuLevel)),
                 ('Claire', wrapper(itemMenu, 1421, 1430, menuLevel)),
                 ('Lechter', wrapper(itemMenu, 1430, 1439, menuLevel)),
                 ('Toval', wrapper(itemMenu, 1439, 1448, menuLevel)),
                 ('Victor', wrapper(itemMenu, 1448, 1457, menuLevel)),
                 ('Aurelia', wrapper(itemMenu, 1457, 1466, menuLevel)),
                 ('Duvalie', wrapper(itemMenu, 1466, 1475, menuLevel)),
                 ('Celine', wrapper(itemMenu, 1475, 1484, menuLevel)),
                 ('Roselia', wrapper(itemMenu, 1484, 1493, menuLevel)),
                 ('Vita', wrapper(itemMenu, 1493, 1502, menuLevel)),
                 ('Estelle', wrapper(itemMenu, 1502, 1511, menuLevel)),
                 ('Joshua', wrapper(itemMenu, 1511, 1520, menuLevel)),
                 ('Renne', wrapper(itemMenu, 1520, 1529, menuLevel)),
                 ('Tita', wrapper(itemMenu, 1529, 1538, menuLevel)),
                 ('Agate', wrapper(itemMenu, 1538, 1547, menuLevel)),
                 ('Arios', wrapper(itemMenu, 1547, 1556, menuLevel)),
                 ('McBurn', wrapper(itemMenu, 1556, 1559, menuLevel)),
                 ('All Boots', wrapper(itemSubMenuMulti, 1106, 1559, menuLevel+1)),
                 ]

        ShowMenu(
            menuVar+(menuLevel-1),
            menuLevel,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    def costumeMenu(menuLevel: int):
        # Character list is in order from t_magic, not from chr metadata.
        items = [('Rean', wrapper(itemMenu, 1780, 1792, menuLevel)),
                 ('Alisa', wrapper(itemMenu, 1792, 1797, menuLevel)),
                 ('Elliot', wrapper(itemMenu, 1797, 1801, menuLevel)),
                 ('Laura', wrapper(itemMenu, 1801, 1805, menuLevel)),
                 ('Emma', wrapper(itemMenu, 1805, 1814, menuLevel)),
                 ('Jusis', wrapper(itemMenu, 1814, 1817, menuLevel)),
                 ('Fie', wrapper(itemMenu, 1817, 1820, menuLevel)),
                 ('Gaius', wrapper(itemMenu, 1820, 1823, menuLevel)),
                 ('Millium', wrapper(itemMenu, 1823, 1827, menuLevel)),
                 ('Juna', wrapper(itemMenu, 1827, 1848, menuLevel)),
                 ('Kurt', wrapper(itemMenu, 1848, 1859, menuLevel)),
                 ('Altina', wrapper(itemMenu, 1859, 1874, menuLevel)),
                 ('Musse', wrapper(itemMenu, 1874, 1893, menuLevel)),
                 ('Ash', wrapper(itemMenu, 1893, 1903, menuLevel)),
                 ('Sara', wrapper(itemMenu, 1903, 1906, menuLevel)),
                 ('Aurelia', wrapper(itemMenu, 1906, 1911, menuLevel)),
                 ('Agate', wrapper(itemMenu, 1911, 1912, menuLevel)),
                 ('Angelica', wrapper(itemMenu, 1912, 1914, menuLevel)),
                 ('Olivert', wrapper(itemMenu, 1914, 1917, menuLevel)),
                 ('Tita', wrapper(itemMenu, 1917, 1921, menuLevel)),
                 ('Tio', wrapper(itemMenu, 1921, 1922, menuLevel)),
                 ('Sharon', wrapper(itemMenu, 1922, 1925, menuLevel)),
                 ('Crow', wrapper(itemMenu, 1925, 1930, menuLevel)),
                 ('Towa', wrapper(itemMenu, 1930, 1933, menuLevel)),
                 ('Duvalie', wrapper(itemMenu, 1933, 1938, menuLevel)),
                 ('Elise', wrapper(itemMenu, 1938, 1942, menuLevel)),
                 ('ALfin', wrapper(itemMenu, 1942, 1946, menuLevel)),
                 ('Randy', wrapper(itemMenu, 1946, 1948, menuLevel)),
                 ('Roselia', wrapper(itemMenu, 1948, 1949, menuLevel)),
                 ('Renna', wrapper(itemMenu, 1949, 1950, menuLevel)),
                 ('KeA', wrapper(itemMenu, 1950, 1952, menuLevel)),
                 ('Celine', wrapper(itemMenu, 1952, 1955, menuLevel)),
                 ('Lloyd', wrapper(itemMenu, 1955, 1957, menuLevel)),
                 ('Elie', wrapper(itemMenu, 1957, 1958, menuLevel)),
                 ('Noel', wrapper(itemMenu, 1958, 1960, menuLevel)),
                 ('Rixia', wrapper(itemMenu, 1960, 1962, menuLevel)),
                 ('Estelle', wrapper(itemMenu, 1962, 1963, menuLevel)),
                 ('Joshua', wrapper(itemMenu, 1963, 1964, menuLevel)),
                 ('Vita', wrapper(itemMenu, 1964, 1965, menuLevel)),
                 ('Claire', wrapper(itemMenu, 1965, 1969, menuLevel)),
                 ('Lechter', wrapper(itemMenu, 1969, 1970, menuLevel)),
                 ('Rufus', wrapper(itemMenu, 1970, 1974, menuLevel)),
                 ('Lapis', wrapper(itemMenu, 1974, 1976, menuLevel)),
                 ('Swin', wrapper(itemMenu, 1976, 1977, menuLevel)),
                 ('Nadia', wrapper(itemMenu, 1977, 1978, menuLevel)),
                 ('Wazy', wrapper(itemMenu, 1978, 1979, menuLevel)),
                 ('Randy', wrapper(itemMenu, 1979, 1980, menuLevel)),
                 ('Lloyd', wrapper(itemMenu, 1980, 1981, menuLevel)),
                 ('KeA', wrapper(itemMenu, 1981, 1982, menuLevel)),
                 ('Noel', wrapper(itemMenu, 1982, 1983, menuLevel)),
                 ('Rixia', wrapper(itemMenu, 1983, 1984, menuLevel)),
                 ('Tio', wrapper(itemMenu, 1984, 1985, menuLevel)),
                 ('Elie', wrapper(itemMenu, 1985, 1986, menuLevel)),
                 ('Other', wrapper(itemMenu, 1986, 2069, menuLevel)),
                 ('Other2', wrapper(itemMenu, 2069, 2143, menuLevel)),
                 ('Hair', wrapper(itemMenu, 2143, 2216, menuLevel)),
                 ('All Costume', wrapper(itemSubMenuMulti, 1780, 2216, menuLevel+1)),
                 ]

        ShowMenu(
            menuVar+(menuLevel-1),
            menuLevel,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    def quartzMenu(menuLevel: int):
        items = [('Master Quartz', wrapper(itemMenu, 2216, 2303, menuLevel)),
                 ('Earth Quartz', wrapper(itemMenu, 2303, 2369, menuLevel)),
                 ('Water Quartz', wrapper(itemMenu, 2369, 2442, menuLevel)),
                 ('Fire Quartz', wrapper(itemMenu, 2442, 2507, menuLevel)),
                 ('Air Quartz', wrapper(itemMenu, 2507, 2570, menuLevel)),
                 ('Time Quartz', wrapper(itemMenu, 2570, 2624, menuLevel)),
                 ('Space Quartz', wrapper(itemMenu, 2624, 2679, menuLevel)),
                 ('Mirage Quartz', wrapper(itemMenu, 2679, 2735, menuLevel)),
                 ('Lost Arts', wrapper(itemMenu, 2735, 2747, menuLevel)),
                 ]

        ShowMenu(
            menuVar+(menuLevel-1),
            menuLevel,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    def miraMenu(menuLevel: int):
        ShowMenu(
            menuVar+(menuLevel-1),
            menuLevel,
            ('Add 1000 Mira', wrapper(AddItem, 0x04, 0, 1000)),
            ('Add 10000 Mira', wrapper(AddItem, 0x04, 0, 10000)),
            ('Add 100000 Mira', wrapper(AddItem, 0x04, 0, 100000)),
            ('Minus 1000 Mira', wrapper(AddItem, 0x05, 0, 1000)),
            ('Minus 10000 Mira', wrapper(AddItem, 0x05, 0, 10000)),
            ('Minus 100000 Mira', wrapper(AddItem, 0x05, 0, 100000)),
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    OP_23(0x05, 0xFFFF, 100, 0xFFFF, 0xFFFF, 0x00)

    Talk(
        0xFFFF,
        (
            0xB,
            TxtCtl.ShowAll,
            f'Lists generated using vanilla t_item, should have all items\n',
            f'but may not be sorted correctly. (not checked)',
            TxtCtl.NewLine,
            # TxtCtl.Enter,
        ),
    )

    ShowMenu(
        menuVar,
        1,
        ("Mira", wrapper(miraMenu, 2)),
        ("Consumable Items", wrapper(itemMenu, 0, 88, 2)),
        ("Materials", wrapper(itemMenu, 88, 161, 2)),
        ("Extra", wrapper(itemMenu, 161, 196, 2)),
        ("Weapons", wrapper(weaponsMenu, 2)),
        ("Body Armors", wrapper(armorMenu, 2)),
        ("Boots", wrapper(bootsMenu, 2)),
        ("Accessories", wrapper(itemMenu, 1559, 1677, 2)),
        ("Unique Accessories", wrapper(itemMenu, 1677, 1780, 2)),
        ("Costumes", wrapper(costumeMenu, 2)),
        ("Quartz", wrapper(quartzMenu, 2)),
        ("Other", wrapper(itemMenu, 2747, 2806, 2)),
        ("Books", wrapper(itemMenu, 2806, 2989, 2)),
        ("Cooked food", wrapper(itemMenu, 2989, 3082, 2)),
        ("Food mats", wrapper(itemMenu, 3082, 3099, 2)),
        ("Bike", wrapper(itemMenu, 3099, 3123, 2)),
        ("Fishing", wrapper(itemMenu, 3123, 3162, 2)),
        ("Vantage Masters", wrapper(itemMenu, 3162, 3211, 2)),
        ("DLC", wrapper(itemMenu, 3211, 3218, 2)),
        ("All Items", wrapper(itemSubMenuMulti, 0, len(itemList), 2)),
        fontSize=33.0,
    )

    OP_25(0x00)
    OP_25(0x01)
    OP_23(0x05, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0x00)

# Menu for adding/removing party members.
def managePartyMenu(menuVar):
    partyList = getPartyList()

    def addPartyMember():
        items = []

        def addmember(id: int):
            FormationAddMember(id)

        for chrId, chrName in partyList:
            items.append((f"CharacterName: {chrName}, ChrID: {str(chrId)} / {hex(chrId)}", wrapper(addmember, chrId),))

        ShowMenu(
            menuVar+2,
            2,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    def delPartyMember():
        items = []

        def delmember(id: int):
            FormationDelMember(id)

        for chrId, chrName in partyList:
            items.append((f"CharacterName: {chrName}, ChrID: {str(chrId)} / {hex(chrId)}", wrapper(delmember, chrId),))

        ShowMenu(
            menuVar+2,
            2,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    def addPartyMemberReverie():
        items = []

        def addmember(id: int):
            # FormationAddMember(id)
            MenuChrFlagCmd(0x00, id, 0x20000000) #Add to Reverie Corridor party selection
            # MenuChrFlagCmd(0x00, id, 0x08000000) #???

        for chrId, chrName in partyList:
            items.append((f"CharacterName: {chrName}, ChrID: {str(chrId)} / {hex(chrId)}", wrapper(addmember, chrId),))

        ShowMenu(
            menuVar+2,
            2,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    def delPartyMemberReverie():
        items = []

        def delmember(id: int):
            MenuChrFlagCmd(0x01, id, 0x20000000) #Remove from Reverie Corridor party selection

        for chrId, chrName in partyList:
            items.append((f"CharacterName: {chrName}, ChrID: {str(chrId)} / {hex(chrId)}", wrapper(delmember, chrId),))

        ShowMenu(
            menuVar+2,
            2,
            *items,
            fontSize = 33.0,
            pos = (500, 24),
            height = 30,
        )

    ShowMenu(
        menuVar+1,
        1,
        ('Add Party Member to current party', addPartyMember), # Does not work well in Reverie corridor
        ('Remove Party Member to current party', delPartyMember), # Does not work well in Reverie corridor
        ('Add Party Member to Reverie Corridor party select', addPartyMemberReverie),
        ('Remove Party Member to Reverie Corridor party select', delPartyMemberReverie),
        fontSize = 33.0,
    )

# Menu to control opcode tracing
def tracingMenu(menuVar):
    items = []

    def command(string: str):
        Call2SE(string)

    items.append((f'Opcode Trace on', wrapper(command, 'opcodeTracingOn')))
    items.append((f'Opcode Trace off', wrapper(command, 'opcodeTracingOff')))
    

    ShowMenu(
        menuVar+1,
        1,
        *items,
        fontSize = 33.0,
        # pos = (500, 24),
        # height = 30,
    )

# Menu to change level of OutputDebugInfo.
def outputDebugInfoMenu(menuVar):
    items = []
    
    def command(string: str):
        Call2SE(string)

    items.append((f'OutputDebugInfo Level 0: No Info', wrapper(command, 'OutputDebugInfo0')))
    items.append((f'OutputDebugInfo Level 1: Most info', wrapper(command, 'OutputDebugInfo1')))
    items.append((f'OutputDebugInfo Level 2: Less info but more accurate', wrapper(command, 'OutputDebugInfo2')))
    items.append((f'OutputDebugInfo Level 3: String formats only', wrapper(command, 'OutputDebugInfo3')))

    ShowMenu(
        menuVar+1,
        1,
        *items,
        fontSize = 33.0,
        # pos = (500, 24),
        # height = 30,
    )

# ModelBattleStyle stuff
def getBossList():
    # Some exe chrId check stops loading certain ai file even with main check removed.
    return [
        # CS4
        # (0x006B, 'Campanella'),
        # (0x0069, 'Rutger'),
        # (0x006C, 'McBurn'),
        # (0x006D, 'Demon McBurn'),
        # (0x006E, 'Arianrhod'),
        # (0x0087, 'Crown Prince Cedric'),
        # (0x008C, 'Black Alberich'),
        # (0x0090, 'Chancellor Osborne'),
        # (0x00EC, 'Mariabell'),
        # (0x0066, 'Major Claire'),
        # (0x0067, 'Major Lechter'),
        # (0x006A, 'Shirley'),
        # (0x0078, 'Major Michael'),

        (0x0083, 'Father Thomas'),
        (0x0190, 'Supreme Leader Rufus'),
        (0x191, 'Ishmelga Rean'),
        (0x107, 'Dusken Ilya'),
        (0xD7, 'Lady Aurier'),
        (0x006B, 'Campanella'),
        # (0x114, 'Matteus'),
        # (0xBE, 'Cao'),
        # (0x112, 'Garcia'),
        # (0x115, 'Emperor'),
        # (0x6F, 'Emperor Dogma'),
        (0x16E7, 'Mecha Mishy'),
        (0x05, 'Test (should not work), 0x5'),
    ]

def ChangeModelMenu(menuVar):
    def doChange(chrId: int, targetChrId: int):
        DebugString(f'ModelSetBattleStyle(0x{chrId:X}, 0x{targetChrId:X})')
        # ModelSetChrId(chrId, targetChrId) # Does not work in Reverie.
        ModelSetBattleStyle(chrId, targetChrId)
        AnimeClipRefreshSkin(chrId)

    def restore():
        for chrId, _ in getPartyList():
            ModelSetBattleStyle(chrId, 0)
            # AnimeClipRefreshSkin(chrId)

    def showBossMenu(chrId: int, chrName: str):
        # DebugString(f'替换 0x{chrId:X}')

        OP_23(0x05, 0xFFFF, 100, 0xFFFF, 0xFFFF, 0x00)

        # Talk(
        #     0xFFFF,
        #     (
        #         0xB,
        #         TxtCtl.ShowAll,
        #         f'要把 {chrName} 替换成',
        #         # TxtCtl.Enter,
        #     ),
        # )

        items = []
        for bossChrId, bossName in getBossList():
            items.append((
                f'{bossName} (0x{bossChrId:04X})', wrapper(doChange, chrId, bossChrId),
            ))

        ShowMenu(
            menuVar + 1,
            2,
            *items,
            autoExit = True,
            fontSize = 33.0,
            pos = (-1, 230),
            height = 25,
        )

        OP_25(0x00)
        OP_25(0x01)
        OP_23(0x05, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0x00)

    items = []

    for chrId, chrName in getPartyList():
        items.append((
            f'{chrName}', wrapper(showBossMenu, chrId, chrName),
        ))

    items.append(('Restore', lambda: restore()))

    ShowMenu(
        menuVar,
        1,
        *items,
        fontSize = 33.0,
        pos = (500, 24),
        height = 25,
    )

    FormationCmd(0x1B, 0x01)
    FormationCmd(0x1C, 0x01)

def testFunc():
        
    ReplaceBGM(101, 2050) #works
    # ReplaceBGM(125, 2050) #Does not work

    Talk(
        0xFFFF,
        (
            0xB,
            TxtCtl.ShowAll,
            'Debug: Test Func\n',
            'Replaced BGM 101 with 2050',
            TxtCtl.Enter,
        ),
    )

    WaitForMsg()

    OP_25(0x00)
    OP_25(0x01)
    OP_23(0x05, 65535, 65535, 65535, 65535, 0x00)


def ClearFlagsFunc():
    BattleClearFlags(0x00000020) #Clear no BO
    BattleClearFlags(0x00200000) #Clear no skip/auto
    #add text box

def ED8FridaMenu(menuVar):
    ShowMenu(
        menuVar,
        1,
        ('Opcode Trace Menu', wrapper(tracingMenu, 0xF7)),
        ('OutputDebugInfo Menu', wrapper(outputDebugInfoMenu, 0xF7)),
        fontSize = 33.0,
    )

def DiffModMenu(menuVar):
    ShowMenu(
        menuVar,
        1,
        ('Clear BattleFlags (not needed)', ClearFlagsFunc),
        fontSize = 33.0,
    )

def FC_ActMenu_MOD():    
    def showHealObject():
        ExecExpressionWithVar(
            0xF6,
            (
                (Expr.PushLong, 0xFFFFFFFF),
                Expr.Nop,
                Expr.Return,
            ),
        )
        MenuCmd(0x03, 0)
        # Call(ScriptId.System, 'FC_LpBegin')
        Call(ScriptId.System, 'EV_healobject', ParamStr('HealObj00'), ParamInt(0x0002))
        # Call(ScriptId.System, 'FC_LpEnd')

    Call(ScriptId.Debug, 'BeginDebugScript')

    showMenuList = [('DEBUG menu (vanilla debug.dat)', wrapper(DebugMenu, 0xF7)),
                    ('HealObject', showHealObject),
                    ('Open Camp Menu', OpenCampMenu),
                    ('Manage Party Menu', wrapper(managePartyMenu, 0xF7)),
                    ('ED8Frida', wrapper(ED8FridaMenu, 0xF7)),
                    ('Test Function', testFunc),
                    ('ModelBattleStyle swap (experimental/not implemented)', wrapper(ChangeModelMenu, 0xF7)),
                    ]
    
    if (PLAY_BGM_MENU):
        showMenuList.append(('Play BGM (generated from vanilla t_bgm)', wrapper(bgmMenu, 0xF7)))
    if (ITEM_MENU):
        showMenuList.append(('Item menu (generated from vanilla t_item)', wrapper(itemMenu, 0xF7)))
    if (DIFF_MOD_MENU):
        showMenuList.append(('DiffMod Menu', wrapper(DiffModMenu, 0xF7)))

    ShowMenu(
        0xF6,
        0,
        *showMenuList,
        fontSize = 33.0,
    )

    Call(ScriptId.Debug, 'EndDebugScript')

    return Return()

# BtlChangeUnit

def BtlChange(psuedochrIdIn, statusIn):
    doChangeLabel = genLabel()

    # Get value of statusIn
    ExecExpressionWithReg(
        0x1D,
        (
            (Expr.Eval, f"BattleGetChrStatus({str(psuedochrIdIn)}, {str(statusIn)})"),
            Expr.Nop,
            Expr.Return,
        ),
    )

    operationList = [(0x04, Expr.Div2),
                     (0x03, Expr.Mul2),
                     (0x02, Expr.Nop), # Set operation
                     (0x01, Expr.Add2),
                     (0x00, Expr.Sub2)]
    
    for operation, ExprOperation in operationList:
        skipLabel = genLabel()
        # Check what operation to do
        If(
            (
                (Expr.Expr25, 0x3),
                (Expr.PushLong, operation),
                Expr.Equ,
                Expr.Return,
            ),
            skipLabel,
        )
        # Calculate value based on operation.
        ExecExpressionWithReg(
            0x1D,
            (
                (Expr.Expr25, 0x2), #Get Value
                ExprOperation,
                Expr.Return,
            ),
        )
        Jump(doChangeLabel)
        label(skipLabel)

    label(doChangeLabel)
    BattleSetChrStatus(psuedochrIdIn, statusIn, ArgReg(0x1D))

def BtlChangeUnit(status):
    endLabel = genLabel()
    skipDivZeroLabel = genLabel()
    If(
        (
            (Expr.Expr25, 0x2), # Get Value
            (Expr.PushLong, 0x0),
            Expr.Equ,
            (Expr.Expr25, 0x3), #Get Mode/Operation
            (Expr.PushLong, 0x4), #Division
            Expr.Equ,
            Expr.Nez64,
            Expr.Return,
        ),
        skipDivZeroLabel,
    )
    DebugString('Division by zero error')
    Jump(endLabel)

    label(skipDivZeroLabel)

    changeUnitList = [
        (0xFFFE, genLabel()), # Self
        (0xFFFB, genLabel()), # Target
        # Enemies
        (0xF043, genLabel()),
        (0xF044, genLabel()),
        (0xF045, genLabel()),
        (0xF046, genLabel()),
        (0xF047, genLabel()),
        (0xF048, genLabel()),
        (0xF049, genLabel()),
        (0xF04A, genLabel()),
        # Player
        (0xF020, genLabel()),
        (0xF021, genLabel()),
        (0xF022, genLabel()),
        (0xF023, genLabel()),
        (0xF024, genLabel()),
        (0xF025, genLabel()),
        (0xF026, genLabel()),
        (0xF027, genLabel()),

        (0xFFE4, genLabel()), # Brave Order owner
    ]

    Switch(
        (
            (Expr.Expr25, 0x1), #Get PsuedoChrId
            Expr.Return,
        ),
        *changeUnitList,
        (-1, endLabel),
    )

    for chrId, labelStr in changeUnitList:
        label(labelStr)
        BtlChange(chrId, status)
        Jump(endLabel)

    label(endLabel)

# Calls BtlChangeUnit and BtlChange
def BtlChangeUnitChrStatus():
    endLabel = genLabel()

    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x00, 0x00) # Status
    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x01, 0x01) # PsuedoChrID
    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x02, 0x02) # Value
    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x03, 0x03) # Mode/Operation, 0=Sub, 1=Add, 2=Set, 3=Mult, 4=Div (OperationEnum)

    chrStatusList = [
        (0x00000014, genLabel()), # HP
        (0x00000000, genLabel()), # HP percent
        (0x00000015, genLabel()), # EP
        (0x00000001, genLabel()), # EP percent
        (0x00000016, genLabel()), # CP
        (0x00000002, genLabel()), # CP percent
        (0x00000017, genLabel()), # Break
        (0x00000003, genLabel()), # Break percent
    ]

    Switch(
        (
            (Expr.Expr25, 0x0),
            Expr.Return,
        ),
        *chrStatusList,
        (-1, endLabel),
    )

    for chrStatusId, labelStr in chrStatusList:
        label(labelStr)
        BtlChangeUnit(chrStatusId)
        Jump(endLabel)

    label(endLabel)

    Return()

def BtlChangeBP():
    changeBPLabel = genLabel()
    endLabel = genLabel()

    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x00, 0x00) # Value
    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x01, 0x01) # Operation

    skipDivZeroLabel = genLabel()
    If(
        (
            (Expr.Expr25, 0x0),
            (Expr.PushLong, 0x0),
            Expr.Equ,
            (Expr.Expr25, 0x1),
            (Expr.PushLong, 0x4),
            Expr.Equ,
            Expr.Nez64,
            Expr.Return,
        ),
        skipDivZeroLabel,
    )
    DebugString('Division by zero error')
    Jump(endLabel)

    label(skipDivZeroLabel)
    ExecExpressionWithReg(
        0x1D,
        (
            (Expr.Eval, "OP_69(0x16)"), # Get BP value
            Expr.Nop,
            Expr.Return,
        ),
    )

    operationList = [(0x04, Expr.Div2),
                     (0x03, Expr.Mul2),
                     (0x02, Expr.Nop), # Set operation
                     (0x01, Expr.Add2),
                     (0x00, Expr.Sub2)]
    
    for operation, ExprOperation in operationList:
        skipLabel = genLabel()
        # Check what operation to do
        If(
            (
                (Expr.Expr25, 0x1),
                (Expr.PushLong, operation),
                Expr.Equ,
                Expr.Return,
            ),
            skipLabel,
        )
        # Calculate value based on operation.
        ExecExpressionWithReg(
            0x1D,
            (
                (Expr.Expr25, 0x0), #Get Value
                ExprOperation,
                Expr.Return,
            ),
        )
        Jump(changeBPLabel)
        label(skipLabel)

    label(changeBPLabel)
    over8BPLabel = genLabel()
    # Check if computed value is over 8. If so, set to 8 and end.
    If(
        (
            (Expr.PushReg, 0x1D),
            (Expr.PushLong, 8),
            Expr.Geq,
            Expr.Return,
        ),
        over8BPLabel,
    )
    OP_69(0x15, 8)
    Jump(endLabel)
    label(over8BPLabel)

    for value in [7, 6, 5, 4, 3, 2, 1]:
        skipLabel = genLabel()
        If(
            (
                (Expr.PushReg, 0x1D),
                (Expr.PushLong, value),
                Expr.Equ,
                Expr.Return,
            ),
            skipLabel,
        )
        OP_69(0x15, value)
        Jump(endLabel)
        label(skipLabel)

    # Check if computed value is under 0. If so, set to 0 and end.
    skipLabelZero = genLabel()
    If(
        (
            (Expr.PushReg, 0x1D),
            (Expr.PushLong, 0),
            Expr.Leq,
            Expr.Return,
        ),
        skipLabelZero,
    )
    OP_69(0x15, 0)
    label(skipLabelZero)

    label(endLabel)

    Return()

def BtlChangeAG():
    changeAGLabel = genLabel()
    endLabel = genLabel()

    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x00, 0x00) # Value
    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x01, 0x01) # Operation

    skipDivZeroLabel = genLabel()
    If(
        (
            (Expr.Expr25, 0x0),
            (Expr.PushLong, 0x0),
            Expr.Equ,
            (Expr.Expr25, 0x1),
            (Expr.PushLong, 0x4),
            Expr.Equ,
            Expr.Nez64,
            Expr.Return,
        ),
        skipDivZeroLabel,
    )
    DebugString('Division by zero error')
    Jump(endLabel)

    label(skipDivZeroLabel)
    ExecExpressionWithReg(
        0x1D,
        (
            (Expr.Eval, 'OP_C0(0x03EA)'), # Get AG Value
            Expr.Nop,
            Expr.Return,
        ),
    )

    operationList = [(0x04, Expr.Div2),
                     (0x03, Expr.Mul2),
                     (0x02, Expr.Nop), # Set operation
                     (0x01, Expr.Add2),
                     (0x00, Expr.Sub2)]
    
    for operation, ExprOperation in operationList:
        skipLabel = genLabel()
        # Check what operation to do
        If(
            (
                (Expr.Expr25, 0x1),
                (Expr.PushLong, operation),
                Expr.Equ,
                Expr.Return,
            ),
            skipLabel,
        )
        # Calculate value based on operation.
        ExecExpressionWithReg(
            0x1D,
            (
                (Expr.Expr25, 0x0), #Get Value
                ExprOperation,
                Expr.Return,
            ),
        )
        Jump(changeAGLabel)
        label(skipLabel)

    label(changeAGLabel)

    # Check if computed value is over 500. If so, set to 500 and end.
    over500Label = genLabel()
    If(
        (
            (Expr.PushReg, 0x1D),
            (Expr.PushLong, 500),
            Expr.Geq,
            Expr.Return,
        ),
        over500Label,
    )
    OP_C0(0x03E8, 500, 0x0000) #Set AG
    Jump(endLabel)
    label(over500Label)

    for value in range(1, 499):
        skipLabel = genLabel()
        If(
            (
                (Expr.PushReg, 0x1D),
                (Expr.PushLong, value),
                Expr.Equ,
                Expr.Return,
            ),
            skipLabel,
        )
        OP_C0(0x03E8, value, 0x0000) #Set AG
        Jump(endLabel)
        label(skipLabel)

    skipLabelZero = genLabel()
    If(
        (
            (Expr.PushReg, 0x1D),
            (Expr.PushLong, 0),
            Expr.Leq,
            Expr.Return,
        ),
        skipLabelZero,
    )
    OP_C0(0x03E8, 0, 0x0000)
    label(skipLabelZero)

    label(endLabel)

    Return()

# Enemy S-Breaks

# No longer used as animation not great for Reverie. Replaced with SBreak_Enemy_Camera in SBreak_Enemy.
def AniBtlEnemySBreak():
    # LoadEffect(0xFFFE, 0x30, 'battle_sys/sbcutin.eff')
    LoadEffect(0xFFFE, 0x31, 'battle_sys/sbinsert.eff')
    # OP_43(0x65, 300, 1.0, 0)
    # OP_43(0xFE, 0)
    # OP_BC(0x02, 0x0000, ParamInt(0xFFFE), 0x01)
    # OP_BC(0x09, 0x0000, ParamInt(0xFFFE), 0.0, -0.2, -10.0, 10.0, 0.0, 2.5, 0x0000, 3)
    # OP_BC(0x04, 0x0000, ParamInt(0xFFFE), 0x0000, 0x0003)
    # PlayEffect(PseudoChrId.Self, ParamInt(0x0030), 0xFFFF, 0x00000000, ParamStr('scrn'), ParamFloat(960), ParamFloat(540), ParamFloat(0), 0.0, 0.0, 0.0, ParamFloat(1), ParamFloat(1), ParamFloat(1), 0x32)
    # OP_BC(0x0F, 0x0000, ParamInt(0xFFFE), 0xFFFE, 0x00000032, 'cutin')
    # OP_3B(0x00, ParamInt(0x8B7C), ParamFloat(1), ParamInt(0), 0.0, ParamFloat(0), 0x0000, 0xFFFF, 0.0, 0.0, 0.0, ParamFloat(0), '', ParamInt(0), ParamInt(0), 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0.0) #SBreak sound
    # OP_BC(0x08, 0x0000, ParamInt(0xFFFF), 0x00000001)
    # OP_38(PseudoChrId.Self, 0x00, 0x0A, 'BtlDefaultFace')
    # OP_38(PseudoChrId.Self, 0x00, 0x0A, 'AniBtlWait')
    # OP_38(PseudoChrId.Self, 0x00, 0x0A, 'ShowEquip')
    # OP_BC(0x08, 0x0000, ParamInt(0xFFFF), 0x00000000)

    Sleep(250)
    PlayEffect(PseudoChrId.Self, ParamInt(0x0031), 0xFFFF, 0x00000000, ParamStr('scrn'), ParamFloat(960), ParamFloat(100), ParamFloat(0), 0.0, 0.0, 0.0, ParamFloat(1), ParamFloat(1), ParamFloat(1), 0x32)

    # Sleep(400)

    # OP_43(0x65, 300, 1.0, 0)
    # OP_43(0xFE, 0)
    # OP_8B(1.0, 1.0, 1.0, 1.0, 0.0, 0x03)
    # OP_BC(0x05, 0x0000, ParamInt(0xFFFE), 0x012C, 0x0003)
    # OP_BC(0x03, 0x0000, ParamInt(0xFFFE))
    # Sleep(100)

    # ReleaseEffect_(0xFFFE, 0x30)
    ReleaseEffect_(0xFFFE, 0x31)

    return Return()

# Enough CP and seal may cause issues, no sbreak flag?
# Rean may have some issues due to being chrId 0?
def SBreak_Enemy_Core(PsuedoChrIdIn, ScenaFlagIn):
    # ScenaFlag True when chr is SBreaking, False otherwise.
    endLabel = genLabel()
    cpMetLabel = genLabel()
    scenaFlagResetAndEndLabel = genLabel()

    If( # Check CP value of chr and compare to Param3.
        (
            (Expr.Eval, "BattleGetChrStatus(" + str(PsuedoChrIdIn)+ ", 0x16)"), #Check CP value.
            (Expr.Expr25, 0x2),
            Expr.Lss,
            Expr.Return,
        ),
        cpMetLabel,
    )
    # Below code is for not enough CP.

    If( # Check if character of current turn is equal to chrId.
        (
            (Expr.Eval, "BattleCmd(0x5C, 0x02)"), # Get chrId of character turn.
            (Expr.Eval, "BattleGetChrStatus(" + str(PsuedoChrIdIn)+ ", 0x06)"), #Get chrId of PsuedoChrId.
            Expr.Equ,
            Expr.Return,
        ),
        endLabel,
    )
    # Double check this? Should not need this as Can't Move should only be set if needed but no harm in having it.
    # Situation is always clear Can't Move and then set it if needed.
    BattleClearChrAbnormalStatus2(PsuedoChrIdIn, 0x00001000) #Clear can't move if own turn and not enough CP.
    If( # Check if chr is currently SBreaking.
        (
            (Expr.TestScenaFlags, ScenaFlagIn),
            Expr.Return,
        ),
        scenaFlagResetAndEndLabel,
    )
    BattleSetChrAbnormalStatus2(PsuedoChrIdIn, 0x00001000, 0x000003E8, 0x00000001, 0x00) #Set can't move AbnormalStatus to SBREAK FAILED as enemy is sbreaking but not enough CP.
    Jump(scenaFlagResetAndEndLabel)

    #Enough CP for ENEMY_SBREAK
    label(cpMetLabel)

    #Split for if SBreaking or not.
    splitIfSBreaking = genLabel()
    If(
        (
            (Expr.TestScenaFlags, ScenaFlagIn),
            Expr.Return,
        ),
        splitIfSBreaking,
    )

    skipIfNotSealLabel = genLabel()
    # No check if own turn? Add this check. Do not need?
    If(
        (
            (Expr.Eval, "BattleGetChrAbnormalStatus(" + str(PsuedoChrIdIn)+ ")"), #Check if seal. Check if guard break check is needed.
            (Expr.PushLong, 0x2),
            Expr.And,
            Expr.Return,
        ),
        skipIfNotSealLabel,
    )
    BattleSetChrAbnormalStatus2(PsuedoChrIdIn, 0x00001000, 0x000003E8, 0x00000001, 0x00) #Set can't move to cancel S-Break as self is sealed.
    # Check for if current turn to know if to reset ScenaFlag
    If( # Check if character of current turn is equal to chrId.
        (
            (Expr.Eval, "BattleCmd(0x5C, 0x02)"), # Get chrId of character turn.
            (Expr.Eval, "BattleGetChrStatus(" + str(PsuedoChrIdIn)+ ", 0x06)"), #Get chrId of PsuedoChrId.
            Expr.Equ,
            Expr.Return,
        ),
        endLabel, # Should be fine set as endLabel?
    )
    # Do not need to set CP to 180 as no S-Craft.
    Jump(scenaFlagResetAndEndLabel)

    label(skipIfNotSealLabel)
    # State: Not S-Breaking.
    BattleClearChrAbnormalStatus2(PsuedoChrIdIn, 0x00001000) #Clear Can't move. Default state.

    # Not currently SBreaking
    label(splitIfSBreaking)
    # Check for AbnormalStatuses and skip S-Break call if needed.
    If(
        (
            (Expr.Eval, "BattleGetChrAbnormalStatus(" + str(PsuedoChrIdIn)+ ")"),
            (Expr.PushLong, 0x800057D2), #Skip SBreak if AbnormalStatus(Death, Vanish, Nightmare, Charm, Confuse, Faint, Petrify, Freeze, Sleep, Seal). Check what possess is?
            Expr.And,
            Expr.Ez,
            Expr.Return,
        ),
        scenaFlagResetAndEndLabel, #Change to normal endLabel
    )
    If(
        (
            (Expr.Eval, "BattleGetChrAbnormalStatus2(" + str(PsuedoChrIdIn) + ")"),
            (Expr.PushLong, 0x10010), #Skip SBreak if AbnormalStatus2(Hide, GuardBreak). Add Berserk_Rean, can't move?
            Expr.And,
            Expr.Ez,
            Expr.Return,
        ),
        scenaFlagResetAndEndLabel, #Change to normal endLabel
    )

    # Check ScenaFlag for S-Breaking. If True, check if current turn and set CP to allow S-Craft.
    skipIfNotSBreaking = genLabel()
    If(
        (
            (Expr.TestScenaFlags, ScenaFlagIn),
            Expr.Return,
        ),
        skipIfNotSBreaking,
    )
    If(
        (
            (Expr.Eval, "BattleCmd(0x5C, 0x02)"),
            (Expr.Eval, "BattleGetChrStatus(" + str(PsuedoChrIdIn) + ", 0x06)"), #Check if chr turn.
            Expr.Equ,
            Expr.Return,
        ),
        endLabel,
    )
    BattleSetChrStatus(PsuedoChrIdIn, 0x16, ParamInt(0x00B4)) #Set CP to 180 to SCraft, already SBreaked.
    Jump(scenaFlagResetAndEndLabel)

    #Additional requirements to S-Break:
    label(skipIfNotSBreaking)
    skipIfChrTurn = genLabel()
    If(
        (
            (Expr.Expr25, 0x3),
            (Expr.PushLong, 0x1),
            Expr.Equ,
            Expr.Return,
        ),
        skipIfChrTurn,
    )
    If(
        (
            (Expr.Eval, "BattleCmd(0x5C, 0x02)"),
            (Expr.Eval, "BattleGetChrStatus(" + str(PsuedoChrIdIn) + ", 0x06)"), #Check if chr turn.
            Expr.Neq,
            Expr.Return,
        ),
        endLabel, #Update to include ScenaFlagReset. No reason to.
    )

    label(skipIfChrTurn)
    skipIfEnemyTurn = genLabel()
    If(
        (
            (Expr.Expr25, 0x3),
            (Expr.PushLong, 0x2),
            Expr.Equ,
            Expr.Return,
        ),
        skipIfEnemyTurn,
    )
    for chrId in [0xF043, 0xF044, 0xF045, 0xF046, 0xF047, 0xF048, 0xF049, 0xF04A]:
        If(
            (
                (Expr.Eval, "BattleCmd(0x5C, 0x02)"),
                (Expr.Eval, "BattleGetChrStatus("+ str(chrId) +", 0x06)"), #Check if enemy turn.
                Expr.Neq,
                Expr.Return,
            ),
            endLabel, #Update to include ScenaFlagReset.
        )

    label(skipIfEnemyTurn)
    checkEnhanceLabel = genLabel()
    If( # Condition for Enhance
        (
            (Expr.Expr25, 0x4),
            (Expr.PushLong, 0x0),
            Expr.Equ,
            Expr.Return,
        ),
        checkEnhanceLabel,
    )
    If(
        (
            (Expr.Eval, "BattleGetChrAbnormalStatus2(" + str(PsuedoChrIdIn)+ ")"), #Check if enhanced.
            (Expr.PushLong, 0x40),
            Expr.And,
            Expr.Neg,
            Expr.Ez,
            Expr.Return,
        ),
        endLabel, #Update to include ScenaFlagReset.
    )

    label(checkEnhanceLabel)
    If( # Random probability.
        (
            Expr.Rand,
            (Expr.PushLong, 0x64),
            Expr.Mod,
            (Expr.Expr25, 0x1),
            Expr.Lss,
            Expr.Return,
        ),
        endLabel, #Update to include ScenaFlagReset.
    )

    BattleSetChrAbnormalStatus(PsuedoChrIdIn, 0x00000002, 0x000003E8, 0x00000001, 0x00)
    BattleSetChrAbnormalStatus(PsuedoChrIdIn, 0x00000004, 0x000003E8, 0x00000001, 0x00)
    BattleClearChrAbnormalStatus(PsuedoChrIdIn, 0x00000002) # Cancel charging attacks.
    BattleClearChrAbnormalStatus(PsuedoChrIdIn, 0x00000004) # Cancel charging arts.
    BattleClearChrAbnormalStatus2(PsuedoChrIdIn, 0x00001000) # Can't Move.

    # CreateThread(PsuedoChrIdIn, 0x02, 'AniBtlEnemySBreak', ScriptId.Current)
    # WaitForThreadExit(PsuedoChrIdIn, 0x02)

    # BattleCmd(0xAE, PsuedoChrIdIn) #SBreak. Does not work in Reverie.

    Call2SE('SBreak' + hex(PsuedoChrIdIn))
    # SBreak sound.
    OP_3B(0x00, ParamInt(0x8B7C), ParamFloat(1), ParamInt(0), 0.0, ParamFloat(0), 0x0000, 0xFFFF, 0.0, 0.0, 0.0, ParamFloat(0), '', ParamInt(0), ParamInt(0), 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0.0)

    # Move cam to enemy
    def SBreak_Enemy_Camera():
        CameraCmd(0x00)
        BattleCmd(0x47)
        BattleCmd(0x48, PsuedoChrIdIn, 0x0001)
        BattleCmd(0x46, 0.05, 1.0, 15.0)
    SBreak_Enemy_Camera()

    # Do Additional Effect.
    # DebugLog(0x00, ArgInt(5))
    skipAdditionalEffectLabel = genLabel()
    If( # Condition to skip AdditionalEffect
        (
            (Expr.Expr25, 0x5),
            (Expr.PushLong, 0x0),
            Expr.Neq,
            Expr.Return,
        ),
        skipAdditionalEffectLabel,
    )
    Call(ScriptId.Current, 'SBreak_Enemy_Effect', ArgInt(5))
    label(skipAdditionalEffectLabel)

    # Check if chr turn, if so continue and set CP to allow S-Craft from ai file.
    setScenaFlagAndEndLabel = genLabel()
    If(
        (
            (Expr.Eval, "BattleCmd(0x5C, 0x02)"),
            (Expr.Eval, "BattleGetChrStatus(" + str(PsuedoChrIdIn) + ", 0x06)"), #Check if chr turn.
            Expr.Equ,
            Expr.Return,
        ),
        setScenaFlagAndEndLabel,
    )
    BattleSetChrStatus(PsuedoChrIdIn, 0x16, ParamInt(0x00B4)) # Set CP to 180 to allow S-Craft from ai file.
    Sleep(500) # Time between SBreak_Enemy_Camera and S-Craft ani.

    label(setScenaFlagAndEndLabel)
    SetScenaFlags(ScenaFlagIn)
    Jump(endLabel)

    label(scenaFlagResetAndEndLabel)
    ClearScenaFlags(ScenaFlagIn)

    label(endLabel)
    Return()

# Helper Func in scena_writer_helper
def SBreak_Enemy():
    endLabel = genLabel()

    # Parameters for SBreak_Enemy
    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x00, 0x00) # ChrId
    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x01, 0x01) # Percent chance. (0-100) 
    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x02, 0x02) # CP requirement.
    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x03, 0x03) # 1=not chr turn, 2=not enemy turn.
    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x04, 0x04) # 0=not enhanced.
    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x05, 0x05) # Pass through for SBreak_Enemy_Effect.

    sbreakEnemyList = [
        (0xF043, genLabel()),
        (0xF044, genLabel()),
        (0xF045, genLabel()),
        (0xF046, genLabel()),
        (0xF047, genLabel()),
        (0xF048, genLabel()),
        (0xF049, genLabel()),
        (0xF04A, genLabel()),
        ]

    Switch(
        (
            (Expr.Expr25, 0x0),
            Expr.Return,
        ),
        *sbreakEnemyList,
        (-1, endLabel),
    )

    i = 0
    for psuedoChrId, psuedoChrIdLabel in sbreakEnemyList:
        label(psuedoChrIdLabel)
        SBreak_Enemy_Core(psuedoChrId, 0x2000+i)
        i = i + 1
        Jump(endLabel)

    label(endLabel)

# Clears ScenaFlag for enemy character when they S-Break and use their S-Craft.
# Add to end of all craft finish in btlcom.
def SBreak_Enemy_Finish():
    endLabel = genLabel()
    If(
        (
            (Expr.Eval, "BattleGetChrStatus(0xFFFE, 0x0A)"), #Check craft type, if SCraft.
            (Expr.PushLong, 0x1F),
            Expr.Equ,
            Expr.Return,
        ),
        endLabel,
    )

    for chrId in [0xF043, 0xF044, 0xF045, 0xF046, 0xF047, 0xF048, 0xF049, 0xF04A]:
        skipLabel = genLabel()
        If(
            (
                (Expr.Eval, "FormationCmd(0x0C, PseudoChrId.Self, " + str(chrId) +")"), #Check if chr turn.
                Expr.Return,
            ),
            skipLabel,
        )
        ClearScenaFlags(chrId - 0xD043)
        label(skipLabel)

    label(endLabel)

    Return()

# Put in all battle files with enemy S-Breaks.
def SBreak_Enemy_Maintain():
    # Limit Enemy CP for Enemy SBreak probability system.
    for chrId in [0xF043, 0xF044, 0xF045, 0xF046, 0xF047, 0xF048, 0xF049, 0xF04A]:
        skipLabel = genLabel()
        # If no ScenaFlag to say enemy is SBreaking.
        If(
            (
                (Expr.TestScenaFlags, (chrId - 0xD043)),
                Expr.Ez, #Invert above check? (not suppose to be Expr.Ez?)
                (Expr.Eval, "BattleGetChrStatus(" + str(chrId) + ", 0x16)"),
                (Expr.PushLong, 0xB4), #180
                Expr.Geq,
                Expr.And,
                Expr.Return,
            ),
            skipLabel,
        )
        BattleSetChrStatus(chrId, 0x16, ParamInt(0x0096)) #Limit CP of enemy to 150.
        label(skipLabel)

    # Update ScenaFlags and AbnormalStatuses.
    # Have to Call EnemySBreak in case script conditions means a turn can happen with no call to EnemySBreak.
    EnemySBreak(0xF043, 0, 100, EnemySBreakChrTurnEnum.NoCheck, True)
    EnemySBreak(0xF044, 0, 100, EnemySBreakChrTurnEnum.NoCheck, True)
    EnemySBreak(0xF045, 0, 100, EnemySBreakChrTurnEnum.NoCheck, True)
    EnemySBreak(0xF046, 0, 100, EnemySBreakChrTurnEnum.NoCheck, True)
    EnemySBreak(0xF047, 0, 100, EnemySBreakChrTurnEnum.NoCheck, True)
    EnemySBreak(0xF048, 0, 100, EnemySBreakChrTurnEnum.NoCheck, True)
    EnemySBreak(0xF049, 0, 100, EnemySBreakChrTurnEnum.NoCheck, True)
    EnemySBreak(0xF04A, 0, 100, EnemySBreakChrTurnEnum.NoCheck, True)

    if DEBUG_MESSAGES:
        SBreak_Enemy_CP_Output()

    Return()

def SBreak_Enemy_CP_Output():
    for chrId in [0xF043, 0xF044, 0xF045, 0xF046, 0xF047, 0xF048, 0xF049, 0xF04A]:
        endLabel = genLabel()

        for i in range(0,201):
            skipLabel = genLabel()
            If(
                (
                    (Expr.Eval, "BattleGetChrStatus(" + str(chrId) + ", 0x16)"),
                    (Expr.PushLong, i),
                    Expr.Equ,
                    Expr.Return,
                ),
                skipLabel,
            )
            DebugString(f"{hex(chrId)} Debug CP Value: {str(i)}")
            # BattleShowText("Debug CP Value: " + str(i))
            Jump(endLabel)
            label(skipLabel)

        label(endLabel)

def SBreak_Enemy_Effect():
    endLabel = genLabel()

    # Parameters
    OP_0C(0x00, 0x01)
    OP_0E(0x00, 0x00, 0x00)
    # DebugLog(0x00, ArgInt(0)) #Debug output to check input parameter.

    # Check for no AdditonalEffect to skip function. Second check.
    skipNoEffectLabel = genLabel()
    If(
        (
            (Expr.Expr25, 0x0),
            (Expr.PushLong, 0x0), #No effect.
            Expr.Equ,
            Expr.Return,
        ),
        skipNoEffectLabel,
    )
    Jump(endLabel)

    label(skipNoEffectLabel)
    skipEffectOne = genLabel()
    If(
        (
            (Expr.Expr25, 0x0),
            (Expr.PushLong, 0x1),
            Expr.Equ,
            Expr.Return,
        ),
        skipEffectOne,
    )
    def StealthBreaker():
        BattleShowText("Stealth Breaker")
        BattleClearChrAbnormalStatus(0xF020, 0x20000000)
        BattleClearChrAbnormalStatus(0xF021, 0x20000000)
        BattleClearChrAbnormalStatus(0xF022, 0x20000000)
        BattleClearChrAbnormalStatus(0xF023, 0x20000000)
    StealthBreaker()
    Sleep(400)
    Jump(endLabel)

    label(skipEffectOne)
    skipEffectTwo = genLabel()
    If(
        (
            (Expr.Expr25, 0x0),
            (Expr.PushLong, 0x2), #Break current BO.
            Expr.Equ,
            Expr.Return,
        ),
        skipEffectTwo,
    )
    BattleCmd(0xA7, 0x01)
    Sleep(100)
    Jump(endLabel)

    label(skipEffectTwo)
    skipEffectThree = genLabel()
    If(
        (
            (Expr.Expr25, 0x0),
            (Expr.PushLong, 0x3), #Absolute Reflect Breaker
            Expr.Equ,
            Expr.Return,
        ),
        skipEffectThree,
    )
    def AbsoluteReflectBreaker():
        BattleShowText("Absolute Reflect Breaker")
        BattleClearChrAbnormalStatus2(0xF020, 0x00000400)
        BattleClearChrAbnormalStatus2(0xF021, 0x00000400)
        BattleClearChrAbnormalStatus2(0xF022, 0x00000400)
        BattleClearChrAbnormalStatus2(0xF023, 0x00000400)
    AbsoluteReflectBreaker()

    label(skipEffectThree)
    label(endLabel)
    Return()

# Other

def OpenCampMenu():
    ExecExpressionWithVar(
        0xF6,
        (
            (Expr.PushLong, 0xFFFFFFFF),
            Expr.Nop,
            Expr.Return,
        ),
    )
    MenuCmd(0x03, 0)
    # OP_90('current', 0x0000002D)
    OP_94(0x00, 0x11019400)

    # OP_25(0x01)
    # Sleep(300)
    Return()


