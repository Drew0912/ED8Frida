// dllmain.cpp : Defines the entry point for the DLL application.
#include "pch.h"

#include <iostream>
#include <fstream>

const bool DEBUGCONSOLE = TRUE;

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

// Gets .js frida script as std::string with same name as exe. (hnk.js)
std::string static GetScript() {
    printf("[*] Getting Frida Script\n");
    char exePath[MAX_PATH];
    GetModuleFileNameA(NULL, exePath, MAX_PATH);
    std::string scriptPath = exePath;
    scriptPath = scriptPath.substr(0, scriptPath.size() - 4) + ".js";

    printf("[*] Script located at %s\n", scriptPath.c_str());

    std::ifstream in(scriptPath);
    std::string contents((std::istreambuf_iterator<char>(in)), std::istreambuf_iterator<char>());

    return contents;
}

// Frida on_message
static void on_message(FridaScript* script, const gchar* message, GBytes* data, gpointer user_data) {
    JsonParser* parser;
    JsonObject* root;
    const gchar* type;

    parser = json_parser_new();
    json_parser_load_from_data(parser, message, -1, NULL);
    root = json_node_get_object(json_parser_get_root(parser));

    type = json_object_get_string_member(root, "type");
    if (strcmp(type, "log") == 0)
    {
        const gchar* log_message;

        log_message = json_object_get_string_member(root, "payload");
        g_print("%s\n", log_message);
    }
    else if (strcmp(type, "error") == 0) {
        g_print("%s\n", json_object_get_string_member(root, "stack"));
    }
    else
    {
        g_print("on_message: %s\n", message);
    }

    g_object_unref(parser);
}

class FridaLoader {
protected:
    HANDLE hInitEvent, hExitEvent;
    //HANDLE hFridaThread;
    std::string script;
    GMainLoop* loop = NULL;

public:
    FridaLoader() {
        printf("[*] Creating FridaLoader.\n");
        this->hInitEvent = CreateEventA(NULL, FALSE, FALSE, "InitThread");
        if (this->hInitEvent == NULL) {
            printf("[*] hInitEvent Failed: (%d)\n", GetLastError());
        }

        this->hExitEvent = CreateEventA(NULL, FALSE, FALSE, "ExitThread");
        if (this->hExitEvent == NULL) {
            printf("[*] hExitEvent Failed: (%d)\n", GetLastError());
        }
        printf("[*] Finished creating FridaLoader\n");
    }
    ~FridaLoader() {
        printf("[*] Terminating FridaLoader\n");
        //this->Stop();
        WaitForSingleObject(hExitEvent, INFINITE);
        CloseHandle(this->hInitEvent);
        CloseHandle(this->hExitEvent);
    }

    int Start();
    int Stop();

protected:
    int FridaCore();

};

FridaLoader* gFrida;

int FridaLoader::Start() {
    printf("[*] FridaLoader::Start\n");

    this->script = GetScript();

    this->FridaCore();
    //WaitForSingleObject(this->hInitEvent, INFINITE);
    //printf("[*] WaitForSingleObject Finished");

    return 1;
}


int FridaLoader::Stop() {
    //Add check if FridaCore is running.

    SetEvent(this->hExitEvent);

    //

    return 1;
}

int FridaLoader::FridaCore() {
    printf("[*] Starting FridaCore\n");

    FridaDeviceManager* manager = NULL;
    GError* error = NULL;
    FridaDevice* local_device = NULL;
    FridaSession* session;

    frida_init();
    g_print("[*] FridaCore init\n");

    this->loop = g_main_loop_new(NULL, TRUE);

    //signal(SIGINT, on_signal);
    //signal(SIGTERM, on_signal);

    manager = frida_device_manager_new();

    g_assert(error == NULL);

    local_device = frida_device_manager_find_device_by_type_sync(manager, FRIDA_DEVICE_TYPE_LOCAL, 0, NULL, &error);
    g_assert(local_device != NULL);


    FridaSessionOptions* sessionOptions = frida_session_options_new();
    frida_session_options_set_realm(sessionOptions, FRIDA_REALM_NATIVE);
    session = frida_device_attach_sync(local_device, GetCurrentProcessId(), sessionOptions, NULL, &error);
    //session = frida_device_attach_sync(local_device, GetCurrentProcessId(), NULL, NULL, &error);
    g_clear_object(&sessionOptions);
    if (error == NULL)
    {
        FridaScript* script;
        FridaScriptOptions* options;

        //g_signal_connect(session, "detached", G_CALLBACK(on_detached), NULL);
        if (frida_session_is_detached(session))
            goto session_detached_prematurely;

        g_print("[*] Attached\n");

        options = frida_script_options_new();
        frida_script_options_set_name(options, "Reverie");
        frida_script_options_set_runtime(options, FRIDA_SCRIPT_RUNTIME_QJS);

        //script = frida_session_create_script_sync(session, "(new NativeFunction(Process.getModuleByName('KERNEL32.dll').getExportByName('AllocConsole'), 'bool', []))();", options, NULL, &error);
        script = frida_session_create_script_sync(session, this->script.c_str(), options, NULL, &error);
        g_assert(error == NULL);

        g_clear_object(&options);

        g_signal_connect(script, "message", G_CALLBACK(on_message), NULL);

        frida_script_load_sync(script, NULL, &error);
        g_assert(error == NULL);

        g_print("[*] Script loaded\n");

        if (GetConsoleWindow() != NULL) {
            FILE* new_stdout;
            freopen_s(&new_stdout, "CONOUT$", "wb", stdout);
            SetConsoleOutputCP(CP_UTF8);
        }

        if (g_main_loop_is_running(loop))
            g_main_loop_run(loop);

        g_print("[*] Stopped\n");

        frida_script_unload_sync(script, NULL, NULL);
        frida_unref(script);
        g_print("[*] Unloaded\n");

        frida_session_detach_sync(session, NULL, NULL);
    session_detached_prematurely:
        frida_unref(session);
        g_print("[*] Detached\n");
    }
    else
    {
        g_printerr("Failed to attach: %s\n", error->message);
        g_error_free(error);
    }

    frida_unref(local_device);

    frida_device_manager_close_sync(manager, NULL, NULL);
    frida_unref(manager);
    g_print("[*] Closed\n");

    g_main_loop_unref(loop);

    SetEvent(this->hInitEvent);

    return 0;
}

int StartFrida() {
    gFrida = new FridaLoader;
    gFrida->Start();

    return 1;
}

int main() {
    if (DEBUGCONSOLE) {
        AllocConsole();
        FILE* new_stdout;
        freopen_s(&new_stdout, "CONOUT$", "wb", stdout);
        SetConsoleOutputCP(CP_UTF8);
    }
    DWORD threadId = NULL;
    HANDLE HackThread = CreateThread(NULL, 0, (LPTHREAD_START_ROUTINE)StartFrida, NULL, 0, &threadId);

    return 1;
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
        break;
    }
    return TRUE;
}


