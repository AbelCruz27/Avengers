import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
    try {
        const auth = getAuthFromRequest(request);
        if (!auth || !auth.photographerId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id: galleryId } = await params;

        // Verify gallery ownership
        const gallery = await prisma.gallery.findFirst({
            where: { id: galleryId, photographerId: auth.photographerId },
        });

        if (!gallery) {
            return NextResponse.json({ error: 'Galería no encontrada' }, { status: 404 });
        }

        const formData = await request.formData();
        const files = formData.getAll('photos') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No se enviaron archivos' }, { status: 400 });
        }

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', auth.photographerId, galleryId);
        await mkdir(uploadDir, { recursive: true });

        const uploadedPhotos = [];
        const currentMaxOrder = await prisma.photo.count({ where: { galleryId } });

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate unique filename
            const ext = path.extname(file.name);
            const uniqueName = `${Date.now()}-${i}${ext}`;
            const filePath = path.join(uploadDir, uniqueName);

            // Write file to disk
            await writeFile(filePath, buffer);

            // Create URL path (relative to public folder)
            const url = `/uploads/${auth.photographerId}/${galleryId}/${uniqueName}`;

            // Save to database
            const photo = await prisma.photo.create({
                data: {
                    galleryId,
                    url,
                    thumbnailUrl: url, // In production, generate actual thumbnails
                    filename: file.name,
                    size: file.size,
                    order: currentMaxOrder + i,
                },
            });

            uploadedPhotos.push({
                id: photo.id,
                url: photo.url,
                filename: photo.filename,
            });
        }

        return NextResponse.json({
            message: `${uploadedPhotos.length} fotos subidas`,
            photos: uploadedPhotos,
        }, { status: 201 });
    } catch (error) {
        console.error('Error uploading photos:', error);
        return NextResponse.json({ error: 'Error al subir las fotos' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const auth = getAuthFromRequest(request);
        if (!auth || !auth.photographerId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id: galleryId } = await params;
        const { searchParams } = new URL(request.url);
        const photoId = searchParams.get('photoId');

        if (!photoId) {
            return NextResponse.json({ error: 'photoId requerido' }, { status: 400 });
        }

        // Verify gallery ownership
        const gallery = await prisma.gallery.findFirst({
            where: { id: galleryId, photographerId: auth.photographerId },
        });

        if (!gallery) {
            return NextResponse.json({ error: 'Galería no encontrada' }, { status: 404 });
        }

        // TODO: Delete physical file from disk

        await prisma.photo.delete({ where: { id: photoId } });

        return NextResponse.json({ message: 'Foto eliminada' });
    } catch (error) {
        console.error('Error deleting photo:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
