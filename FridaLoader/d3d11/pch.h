// pch.h: This is a precompiled header file.
// Files listed below are compiled only once, improving build performance for future builds.
// This also affects IntelliSense performance, including code completion and many code browsing features.
// However, files listed here are ALL re-compiled if any one of them is updated between builds.
// Do not add files here that you will be updating frequently as this negates the performance advantage.

#ifndef PCH_H
#define PCH_H

// add headers that you want to pre-compile here
#include "framework.h"
#include "d3d11.h"

#pragma comment(lib, "Setupapi.lib") //Needed for frida-core, using V16.4.10 as later versions have issues.
#include "frida-core/frida-core.h"

#endif //PCH_H
