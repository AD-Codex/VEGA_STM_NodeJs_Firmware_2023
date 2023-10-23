# stm32_firmupdate_Nodejs

## stm32 firmupdate step
1. BOOT0 to 1
2. RESET to 1
3. RESET to 0

## boot mode enter
1. TX 0x7F
2. RX 0x79

## flash erase
1. TX 0x43
2. TX 0xBC
3. RX 0x79		// erasing flash
4. TX 0xFF
5. TX 0x00
6. RX 0x79		// flash Erase success

## ---------------- loop start ---------------
1. TX 0x31
2. TX 0xCE
3. RX 0x79

### send address starting 0x08000000<br>
0x12345678<br>
|31-----------24|23-----------16|15------------8|7---------bit 0|<br>
+---------------+---------------+---------------+---------------+<br>
|0 0 0 1 0 0 1 0|0 0 1 1 0 1 0 0|0 1 0 1 0 1 1 0|0 1 1 1 1 0 0 0|<br>
+---------------+---------------+---------------+---------------+<br>

4. TX - <br>
1byte - 0 0 0 1 0 0 1 0<br>
2byte - 0 0 1 1 0 1 0 0<br>
3byte - 0 1 0 1 0 1 1 0<br>
4byte - 0 1 1 1 1 0 0 0<br>
5byte - XOR (|0 0 0 1 0 0 1 0|0 0 1 1 0 1 0 0|0 1 0 1 0 1 1 0|0 1 1 1 1 0 0 0|)<br>

5. RX 0x79		// address send<br>

6. TX number of bytes --- (128 -1)<br>

7. Tx 128 byte send<br>

### checksunm TX -- XOR(send byte)<br>
8. RX 0x79		// packet send done .........................<br>

------------ loop end ------------------------<br>

## boot mode exit
1. BOOT0 to 0
2. RESET to 1
3. RESET to 0



## Referecnce
1. https://nodejs.org/docs/latest-v12.x/api/
2. https://medium.com/hackernoon/arduino-serial-data-796c4f7d27ce
3. https://serialport.io/docs/next/api-serialport
4. https://theiotlearninginitiative.gitbook.io/embedded-linux/subsystems/general-purpose-input-output
5. http://doc.industio.com/docs/ssd20x_manual/ssd20x_manual-1cradq5hh4qn2
6. https://github.com/florisla/stm32loader/tree/master
