import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { handleImageUpload } from "@/features/images/services"; // Importação corrigida
import { supabase } from "@/lib/supabase";

const Testes: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<"idle"|"uploading"|"success"|"error">("idle");
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  // Recupera o userId sempre que a tela monta
  useEffect(() => {
    fetchUserId();
  }, []);

  // Função para obter o ID do usuário autenticado
  const fetchUserId = async () => {
    const userResp = await supabase.auth.getUser();
    if (userResp?.data?.user) {
      setUserId(userResp.data.user.id);
      return userResp.data.user.id;
    }
    setUserId(null);
    return null;
  };

  const handleFileChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.files && ev.target.files.length > 0) {
      setFile(ev.target.files[0]);
      setUploadState("idle");
      setPublicUrl(null);
      setUploadMsg(null);
      setDbError(null);
      setStorageError(null);
    }
  };

  const handleUpload = async () => {
    setUploadState("uploading");
    setPublicUrl(null);
    setUploadMsg(null);
    setDbError(null);
    setStorageError(null);

    const id = await fetchUserId();
    if (!file || !id) {
      setUploadState("error");
      setUploadMsg("Selecione um arquivo e tenha certeza de estar autenticado.");
      return;
    }

    let resultUrl: string | null = null;
    try {
      // UPA A IMAGEM USANDO O FLUXO NORMAL
      resultUrl = await handleImageUpload(file);
      setPublicUrl(resultUrl);
      setUploadState("success");
      setUploadMsg("✅ Upload realizado com sucesso!");
      setDbError(null);
      setStorageError(null);
      // Registro no console
      console.log("user_id:", id);
      console.log("Upload result (URL):", resultUrl);
      console.log("storeImageMetadata: OK (handled internamente no handleImageUpload)");
    } catch (err: Error) {
      // Erro pode vir do Storage OU do banco
      // handleImageUpload lança o erro correspondente!
      setUploadState("error");
      setUploadMsg("❌ Falha no upload da imagem.");
      setPublicUrl(null);
      let errorMsg = err?.message || JSON.stringify(err);
      // Identifica erro de Storage (supondo que mensagem contenha)
      if (errorMsg.toLowerCase().includes("storage")) {
        setStorageError(errorMsg);
        setDbError(null);
        console.log("user_id:", id);
        console.log("Upload Storage ERROR:", errorMsg);
      } else {
        setStorageError(null);
        setDbError(errorMsg);
        console.log("user_id:", id);
        console.log("DB insert ERROR:", errorMsg);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> Teste de Upload de Imagem
          </CardTitle>
          <CardDescription>
            Teste funcional do upload com feedback de Storage, banco e debug de RLS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Input 
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
              disabled={uploadState === "uploading"}
            />
            <Button 
              onClick={handleUpload}
              disabled={!file || uploadState === "uploading"}
            >
              Enviar Imagem
            </Button>

            {userId && (
              <div className="text-sm text-gray-400">user_id autenticado: <span className="text-white">{userId}</span></div>
            )}

            {uploadState === "success" && publicUrl && (
              <div className="p-3 bg-green-900/30 border border-green-800 rounded text-green-300 text-sm">
                ✅ Upload realizado! URL pública: <br/>
                <a href={publicUrl} className="break-all underline text-green-300" target="_blank" rel="noopener noreferrer">{publicUrl}</a>
              </div>
            )}
            {uploadState === "error" && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded text-red-300 text-sm">
                {uploadMsg}
                {storageError && (
                  <div className="mt-1">
                    <b>Erro do Storage:</b> <span className="text-red-200">{storageError}</span>
                  </div>
                )}
                {dbError && (
                  <div className="mt-1">
                    <b>Erro do Banco:</b> <span className="text-red-200">{dbError}</span>
                  </div>
                )}
              </div>
            )}
            {uploadState === "uploading" && <div className="text-blue-400 text-sm">Enviando imagem...</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Testes;
