import { useState, useEffect } from 'react';

export const useFilePreview = (file: File | null) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Clean up the object URL on unmount
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return preview;
};
