import { Router } from 'express'
import { InferenceClient } from "@huggingface/inference";
import { Buffer } from 'buffer';
import { HF_TOKEN } from '../config.js';

const sketchRouter = Router()
const client = new InferenceClient(HF_TOKEN);

sketchRouter.post('/', async (req, res) => {

    try {
        const { prompt } = req.body;
        console.log(`Generating image -> ${prompt}`)

        const imageBlob = await client.textToImage({
            provider:    "hf-inference",       //.  hf-inference   fal-ai
            model: "stabilityai/stable-diffusion-xl-base-1.0",   // . stabilityai/stable-diffusion-xl-base-1.0       black-forest-labs/FLUX.1-dev
            inputs: prompt,
            parameters: { num_inference_steps: 5 },
        });

        //convert blob to buffer
        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        //set browser this is an image
        res.set('Content-Type', 'image/png');

        // send actual image
        return res.send(buffer)

       


    } catch (error) {
        console.log("error -> ", error)
        res.status(500).json({ error: 'failed to generate image' });
    }


})

export default sketchRouter;
