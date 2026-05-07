'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps: any[],
) {
  useEffect(() => {
    const t = setTimeout(() => {
      fn(...deps);
    }, waitTime);

    return () => {
      clearTimeout(t);
    };
  }, deps);
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

const EditProfilePage = () => {
  const [imgSrc, setImgSrc] = useState('');
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [aspect, setAspect] = useState<number | undefined>(1);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
        );
      }
    },
    100,
    [completedCrop],
  );

  const handleSave = () => {
    // Logika untuk menyimpan data profil
    console.log('Profile saved!');
    if (previewCanvasRef.current) {
        const base64Image = previewCanvasRef.current.toDataURL('image/jpeg');
        // send to server
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Edit Profil Ahli Gizi</h1>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        <div className="flex flex-col items-center md:col-span-1">
          <h2 className="mb-4 text-xl font-semibold">Foto Profil</h2>
          <div className="mb-4 h-48 w-48 rounded-full bg-gray-200 overflow-hidden">
            {completedCrop && (
                <canvas
                    ref={previewCanvasRef}
                    className="w-full h-full"
                />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            className="text-sm"
          />

          {imgSrc && (
            <div className="mt-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
              >
                <img
                    ref={imgRef}
                    src={imgSrc}
                    alt="Source"
                    onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <form className="space-y-6">
            <Input label="Nama Lengkap" placeholder="Contoh: , S.Gz" />
            <Input label="Gelar" placeholder="Contoh: S.Gz, M.Gizi" />
            <Input label="Posisi" placeholder="Contoh: Clinical Dietitian" />
            <Input label="Nomor STR" placeholder="Nomor Surat Tanda Registrasi" />
            <Input label="Pengalaman" placeholder="Contoh: 5 tahun" />
            <div>
              <label className="mb-2 block text-sm font-medium">Bio Singkat</label>
              <textarea className="w-full rounded-md border border-gray-300 p-2" placeholder="Ceritakan sedikit tentang diri Anda..."></textarea>
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium">Spesialisasi</label>
                <div className="flex flex-wrap gap-2">
                    <Badge>Diabetes</Badge>
                    <Badge>Gizi Anak</Badge>
                    <Badge>Diet Keto</Badge>
                </div>
                 <Input className="mt-2" placeholder="Tambah spesialisasi baru..." />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <Input label="LinkedIn" placeholder="URL profil LinkedIn" />
                <Input label="Instagram" placeholder="URL profil Instagram" />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave}>Simpan Perubahan</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;

// Helper function to preview canvas
export function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
) {
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const pixelRatio = window.devicePixelRatio

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = 'high'

  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY

  const centerX = image.naturalWidth / 2
  const centerY = image.naturalHeight / 2

  ctx.save()

  ctx.translate(-cropX, -cropY)
  ctx.translate(centerX, centerY)
  ctx.translate(-centerX, -centerY)
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  )

  ctx.restore()
}
