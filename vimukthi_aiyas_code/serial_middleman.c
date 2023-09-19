#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <termios.h>

#define UART_DEVICE "/dev/ttyS2" // uart device name

int main(int argc, char *argv[])
{
    int fd, res, inMsg;
    struct termios oldtio, newtio;
    char ch;
    char buf[256] = {0};

    // open uart dev file, not set O_NONBLOCK attr
    fd = open(UART_DEVICE, O_RDWR | O_NOCTTY);
    if (fd < 0)
    {
        perror(UART_DEVICE);
        exit(1);
    }
    else
        printf("Open %s successfully\n", UART_DEVICE);

    // get current operation parameter
    tcgetattr(fd, &oldtio);
    memset(&newtio, 0, sizeof(newtio));

    // buad = 115200,data type = 8bit,enable receive mode
    newtio.c_cflag = B115200 | CS8 | CLOCAL | CREAD;

    // fuart enable cts/rts
    newtio.c_cflag |= CRTSCTS;

    // ignore parity sum frame errors
    newtio.c_iflag = IGNPAR;

    // enable output options
    newtio.c_oflag = OPOST;

    // set normal mode
    // newtio.c_lflag = ICANON;

    // flush input and output cache
    tcflush(fd, TCIFLUSH);
    // set new operation parameter
    tcsetattr(fd, TCSANOW, &newtio);

    // send data to uart
    //res = write(fd, '{" m ":2 , " k ":" jU1LDI1NSwyNTUs "}', 16);
    //  -----   while (1)
    //     {
    //         // get data from console and send to uart until receive the '#' char
    //     -----    while ((ch = getchar()) != '#')
    //         {
    //             buf[0] = ch;
    //             res = write(fd, buf, 1);
    //         }

    //         buf[0] = ch;
    //         buf[1] = '\n';
    //         res = write(fd, buf, 2);
    //         break;
    //  -----   }

    // receive data from uart
    while (1)
    {
        // wait to receive data from uart
        res = read(fd, buf, 255);
        if (res == 0)
            continue;
        
        printf("%s\n",buf);

        //buf[res] = '\0';
        //printf("res = %d, buf = %s\n", res, buf); // print the received char
        /*
        if (buf[0] == '#')                       // exit while until get the '#' char
            inMsg =1;
            
        if (buf[])
            
        if(inMsg)
            printf("%s",buf);    
            
            break;
        */    
        tcflush(fd, TCIFLUSH);
    }

    // close uart dev file and recover the old parameter
    close(fd);
    printf("Close %s\n", UART_DEVICE);
    tcsetattr(fd, TCSANOW, &oldtio);

    return 0;
}
