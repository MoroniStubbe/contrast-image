class Img
{
    raw;
    canvas;


    linkCanvas(id)
    {this.canvas = document.getElementById(id);}

    imageDataToRaw(imageData = this.canvas.getContext('2d').getImageData())
    {
        var raw = [];
        var i3 = 0;
        for(var i1 = 0; i1 < imageData.height; i1++)
        {
            raw.push([]);
            for(var i2 = 0; i2 < imageData.width; i2++)
            {
                raw[i1].push
                ([
                    imageData.data[i3],
                    imageData.data[i3 + 1],
                    imageData.data[i3 + 2],
                    imageData.data[i3 + 3]
                ]);
                i3 += 4;
            }
        }
        return raw;
    }

    rawToImageData(raw = this.raw)
    {
        if(raw)
        {
            var i = 0;
            var imageData = new ImageData(raw[0].length, raw.length);
            for(var y = 0; y < raw.length; y++)
            {
                for(var x = 0; x < raw[0].length; x++)
                {
                    imageData.data[i] = raw[y][x][0];
                    imageData.data[i + 1] = raw[y][x][1];
                    imageData.data[i + 2] = raw[y][x][2];
                    imageData.data[i + 3] = raw[y][x][3];
                    i += 4;
                }
            }
            return imageData;
        }
    }

    putImageData(canvas = this.canvas, x = 0, y = 0)
    {canvas.getContext('2d').putImageData(this.rawToImageData(), x , y);}

    addImportListener(id)
    {
        var t = this;
        var importListener = function(e)
        {
            var ctx = t.canvas.getContext('2d');
            var img = new Image();
            img.src = URL.createObjectURL(e.target.files[0]);
            img.onload = function() 
            {
                t.canvas.width = img.width;
                t.canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                t.raw = t.imageDataToRaw(ctx.getImageData(0, 0, t.canvas.width, t.canvas.height));
            }
        };
        document.getElementById(id).addEventListener('change', importListener);
    }

    contrastPixelAvg(pixel1, pixel2)
    {
        var s = pixel1[0] - pixel2[0];
        s += pixel1[1] - pixel2[1];
        s += pixel1[2] - pixel2[2];
        return Math.floor(s /= 3);
    }

    contrastPixelsMaxAvg(pixel, pixels)
    {
        var c = this.contrastPixelAvg(pixel, pixels[0]);
        var c2;
        for(var i = 1; i < pixels.length; i++)
        {
            c2 = this.contrastPixelAvg(pixel, pixels[i]);
            if(c2 > c)
            {c = c2;}
        }
        return c;
    }

    contrastImage(raw = this.raw, setRaw = false)
    {
        var contrastRaw = [[]];

        //top-left
        var pixels = 
        [
            raw[0][1], 
            raw[1][0], 
            raw[1][1]
        ];
        var p = this.contrastPixelsMaxAvg(raw[0][0], pixels);
        contrastRaw[0].push([p, p, p, p]);

        //top row
        for(var x = 1; x < raw[0].length - 1; x++)
        {
            var x1 = x - 1;
            var x2 = x + 1;
            pixels = 
            [
                raw[0][x1], 
                raw[1][x1], 
                raw[1][x], 
                raw[1][x2], 
                raw[0][x2]
            ];
            p = this.contrastPixelsMaxAvg(raw[0][x], pixels);
            contrastRaw[0].push([p, p, p, p]);
        }

        //top-right
        var x1 = raw[0].length - 1;
        var x2 = x1 - 1;
        pixels = 
        [
            raw[0][x2], 
            raw[1][x2], 
            raw[1][x1]
        ];
        p = this.contrastPixelsMaxAvg(raw[0][x1], pixels);
        contrastRaw[0].push([p, p, p, p]);

        //left
        for(var y = 1; y < raw.length - 1; y++)
        {
            var y1 = y - 1;
            var y2 = y + 1;
            pixels = 
            [
                raw[y1][0], 
                raw[y1][1], 
                raw[y][1], 
                raw[y2][1], 
                raw[y2][0]
            ];
            p = this.contrastPixelsMaxAvg(raw[y][0], pixels);
            contrastRaw.push([]);
            contrastRaw[y].push([p, p, p, p]);
        }

        //middle
        for(var y = 1; y < raw.length - 1; y++)
        {
            for(var x = 1; x < raw[0].length - 1; x++)
            {
                var y1 = y - 1;
                var y2 = y + 1;
                var x1 = x - 1;
                var x2 = x + 1;
                pixels = 
                [
                    raw[y1][x1], 
                    raw[y1][x], 
                    raw[y1][x2], 
                    raw[y][x1], 
                    raw[y][x2], 
                    raw[y2][x1], 
                    raw[y2][x], 
                    raw[y2][x2]
                ];
                p = this.contrastPixelsMaxAvg(raw[y][x], pixels);
                contrastRaw[y].push([p, p, p, p]);
            }
        }

        //right
        x1 = raw[0].length - 1;
        x2 = x1 - 1;
        for(var y = 1; y < raw.length - 1; y++)
        {
            var y1 = y - 1;
            var y2 = y + 1;
            pixels = 
            [
                raw[y1][x1], 
                raw[y1][x2], 
                raw[y][x2], 
                raw[y2][x2], 
                raw[y2][x1]
            ];
            p = this.contrastPixelsMaxAvg(raw[y][x1], pixels);
            contrastRaw[y].push([p, p, p, p]);
        }

        //bottom-left
        var y1 = contrastRaw.length;
        var y2 = y1 - 1;
        contrastRaw.push([]);
        pixels = 
        [
            raw[y2][0], 
            raw[y2][1], 
            raw[y1][1]
        ];
        var p = this.contrastPixelsMaxAvg(raw[y1][0], pixels);
        contrastRaw[y1].push([p, p, p, p]);

        //bottom row
        for(var x = 1; x < raw[0].length - 1; x++)
        {
            x1 = x - 1;
            x2 = x + 1;
            pixels = 
            [
                raw[y1][x1], 
                raw[y2][x1], 
                raw[y2][x], 
                raw[y2][x2], 
                raw[y1][x2]
            ];
            p = this.contrastPixelsMaxAvg(raw[y1][x], pixels);
            contrastRaw[y1].push([p, p, p, p]);
        }

        //bottom-right
        x1 = raw[0].length - 1;
        x2 = x1 - 1;
        pixels = 
        [
            raw[y2][x2], 
            raw[y2][x1], 
            raw[y1][x2]
        ];
        var p = this.contrastPixelsMaxAvg(raw[y1][x1], pixels);
        contrastRaw[y1].push([p, p, p, p]);

        if(setRaw)
        {this.raw = contrastRaw;}

        return contrastRaw;
    }

    forEachPixel(pixelFunction, args, raw = this.raw)
    {
        var newRaw = raw;
        for(var y = 0; y < raw.length; y++)
        {
            for(var x = 0; x < raw[0].length; x++)
            {newRaw[y][x] = pixelFunction(raw[y][x], args);}
        }

        return newRaw;
    }
    
    minBrightness(pixel, brightness)
    {
        if(pixel[0] < brightness || pixel[1] < brightness || pixel[2] < brightness)
        {return [0, 0, 0, 0];}
        else{return pixel;}
    }

    minBrightnessImage(brightness, setRaw = false, raw = this.raw)
    {
        var minBrightnessRaw = this.forEachPixel(this.minBrightness, brightness, raw);
        if(setRaw)
        {this.raw = minBrightnessRaw;}

        return minBrightnessRaw;
    }
}