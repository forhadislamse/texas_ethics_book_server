
import { PrismaClient } from '@prisma/client';
import { IGuideSearchQuery } from './guide.interface';

const prisma = new PrismaClient();

const getAllChapters = async () => {
    const chapters = await prisma.chapter.findMany({
        orderBy: { order: 'asc' },
        include: {
            _count: {
                select: { sections: true }
            }
        }
    });
    return chapters;
};

const getChapterById = async (id: string) => {
    const chapter = await prisma.chapter.findUnique({
        where: { id },
        include: {
            sections: {
                orderBy: { order: 'asc' },
                select: {
                    id: true,
                    number: true,
                    title: true,
                    order: true
                }
            }
        }
    });
    return chapter;
};

const getSectionById = async (id: string) => {
    const section = await prisma.section.findUnique({
        where: { id },
        include: {
            chapter: {
                select: {
                    id: true,
                    number: true,
                    title: true
                }
            }
        }
    });
    return section;
};

const searchGuide = async (query: IGuideSearchQuery) => {
    const { q, page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!q) return { data: [], total: 0 };

    // Simple text search using Prisma's contains for MongoDB
    // Note: For advanced fuzzy search, MongoDB Atlas Search index is needed
    const sections = await prisma.section.findMany({
        where: {
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { content: { contains: q, mode: 'insensitive' } },
                { practiceNotes: { contains: q, mode: 'insensitive' } }
            ]
        },
        include: {
            chapter: {
                select: {
                    number: true,
                    title: true
                }
            }
        },
        orderBy: { order: 'asc' },
        skip,
        take: Number(limit)
    });

    const total = await prisma.section.count({
        where: {
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { content: { contains: q, mode: 'insensitive' } },
                { practiceNotes: { contains: q, mode: 'insensitive' } }
            ]
        }
    });

    return {
        data: sections,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit)
        }
    };
};

export const GuideServices = {
    getAllChapters,
    getChapterById,
    getSectionById,
    searchGuide
};
