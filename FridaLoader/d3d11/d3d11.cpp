// dllmain.cpp : Defines the entry point for the DLL application.
#include "pch.h"

#include <iostream>
#include <fstream>
using namespace std;

const bool LOGGING = true;

// d3d11
using PD3D11CreateDeviceAndSwapChain = HRESULT(*)(
    IDXGIAdapter* pAdapter,
    D3D_DRIVER_TYPE DriverType,
    HMODULE Software,
    UINT Flags,
    const D3D_FEATURE_LEVEL* pFeatureLevels,
    UINT FeatureLevels,
    UINT SDKVersion,
    const DXGI_SWAP_CHAIN_DESC* pSwapChainDesc,
    IDXGISwapChain** ppSwapChain,
    ID3D11Device** ppDevice,
    D3D_FEATURE_LEVEL* pFeatureLevel,
    ID3D11DeviceContext** ppImmediateContext
    );

static PD3D11CreateDeviceAndSwapChain GetD3D11CreateDeviceAndSwapChainAddress() {
    char path[MAX_PATH];
    if (!GetSystemDirectoryA(path, MAX_PATH)) return nullptr;

    strcat_s(path, MAX_PATH * sizeof(char), "\\d3d11.dll");
    HMODULE d3d11 = LoadLibraryA(path);

    if (!d3d11) {
        MessageBox(NULL, L"GetD3D11CreateDeviceAndSwapChainAddress(), could not find d3d11.dll", L"Error", 0);
        return nullptr;
    }

    return (PD3D11CreateDeviceAndSwapChain)*GetProcAddress(d3d11, "D3D11CreateDeviceAndSwapChain");
}

extern "C" HRESULT  D3D11CreateDeviceAndSwapChain(
    IDXGIAdapter * pAdapter,
    D3D_DRIVER_TYPE DriverType,
    HMODULE Software,
    UINT Flags,
    const D3D_FEATURE_LEVEL * pFeatureLevels,
    UINT FeatureLevels,
    UINT SDKVersion,
    const DXGI_SWAP_CHAIN_DESC * pSwapChainDesc,
    IDXGISwapChain * *ppSwapChain,
    ID3D11Device * *ppDevice,
    D3D_FEATURE_LEVEL * pFeatureLevel,
    ID3D11DeviceContext * *ppImmediateContext
) {
    PD3D11CreateDeviceAndSwapChain addr = GetD3D11CreateDeviceAndSwapChainAddress();
    return addr(pAdapter,
        DriverType,
        Software,
        Flags,
        pFeatureLevels,
        FeatureLevels,
        SDKVersion,
        pSwapChainDesc,
        ppSwapChain,
        ppDevice,
        pFeatureLevel,
        ppImmediateContext
    );
}


using PD3D11CreateDevice = HRESULT(*)(
    IDXGIAdapter* pAdapter,
    D3D_DRIVER_TYPE DriverType,
    HMODULE Software,
    UINT Flags,
    const D3D_FEATURE_LEVEL* pFeatureLevels,
    UINT FeatureLevels,
    UINT SDKVersion,
    ID3D11Device** ppDevice,
    D3D_FEATURE_LEVEL* pFeatureLevel,
    ID3D11DeviceContext** ppImmediateContext
    );

static PD3D11CreateDevice GetD3D11CreateDeviceAddress() {
    char path[MAX_PATH];
    if (!GetSystemDirectoryA(path, MAX_PATH)) return nullptr;

    strcat_s(path, MAX_PATH * sizeof(char), "\\d3d11.dll");
    HMODULE d3d11 = LoadLibraryA(path);

    if (!d3d11) {
        MessageBox(NULL, L"GetD3D11CreateDeviceAddress(), could not find d3d11.dll", L"Error", 0);
        return nullptr;
    }

    return (PD3D11CreateDevice)*GetProcAddress(d3d11, "D3D11CreateDevice");
}

extern "C" HRESULT D3D11CreateDevice(
    IDXGIAdapter * pAdapter,
    D3D_DRIVER_TYPE DriverType,
    HMODULE Software,
    UINT Flags,
    const D3D_FEATURE_LEVEL * pFeatureLevels,
    UINT FeatureLevels,
    UINT SDKVersion,
    ID3D11Device * *ppDevice,
    D3D_FEATURE_LEVEL * pFeatureLevel,
    ID3D11DeviceContext * *ppImmediateContext
)
{
    PD3D11CreateDevice addr = GetD3D11CreateDeviceAddress();
    return addr(pAdapter,
        DriverType,
        Software,
        Flags,
        pFeatureLevels,
        FeatureLevels,
        SDKVersion,
        ppDevice,
        pFeatureLevel,
        ppImmediateContext
    );
}


ofstream LogFile("log.txt");
void log(const char* str) {
    if (LOGGING) {
        LogFile << str << endl;
    }
}

void main() {
    log("Hello World!");
}

BOOL APIENTRY DllMain(HMODULE hModule,
    DWORD  ul_reason_for_call,
    LPVOID lpReserved
)
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
        main();
        break;
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
    case DLL_PROCESS_DETACH:
        LogFile.close();
        break;
    }
    return TRUE;
}


