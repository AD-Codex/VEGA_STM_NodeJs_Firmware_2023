# stm32_firmupdate_Nodejs

## stm32 firmupdate step
BOOT0 to 1

RESET to 1
RESET to 0

## boot mode enter

TX 0x7F
RX 0x79

## flash erase
TX 0x43
TX 0xBC
RX 0x79		// erasing flash

TX 0xFF
TX 0x00
RX 0x79		// flash Erase success

## load update

------- loop ---------------
TX 0x31
TX 0xCE
RX 0x79

send address starting 0x08000000

0x12345678
|31           24|23           16|15            8|7         bit 0|
+---------------+---------------+---------------+---------------+
|0 0 0 1 0 0 1 0|0 0 1 1 0 1 0 0|0 1 0 1 0 1 1 0|0 1 1 1 1 0 0 0|
+---------------+---------------+---------------+---------------+

TX
1byte - 0 0 0 1 0 0 1 0
2byte - 0 0 1 1 0 1 0 0
3byte - 0 1 0 1 0 1 1 0
4byte - 0 1 1 1 1 0 0 0
5byte - XOR (|0 0 0 1 0 0 1 0|0 0 1 1 0 1 0 0|0 1 0 1 0 1 1 0|0 1 1 1 1 0 0 0|)

RX 0x79		// address send

TX number of bytes --- (128 -1)

Tx 128 byte send

checksunm TX -- XOR(send byte)

RX 0x79		// packet send done .........................




512KB files


BOOT0 to 0

RESET to 1
RESET to 0
----------------------------------------------


## Referecnce
1. https://nodejs.org/docs/latest-v12.x/api/
2. https://medium.com/hackernoon/arduino-serial-data-796c4f7d27ce
3. https://serialport.io/docs/next/api-serialport
4. https://theiotlearninginitiative.gitbook.io/embedded-linux/subsystems/general-purpose-input-output
5. http://doc.industio.com/docs/ssd20x_manual/ssd20x_manual-1cradq5hh4qn2
6. https://github.com/florisla/stm32loader/tree/master
