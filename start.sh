#!/bin/bash

tmux new-session -d -s aplay 'aplay /opt/infopix/fed-diag-uic-demo-44330/vaganyzar_felolvasva.wav 2>&1 | logger -t play'
