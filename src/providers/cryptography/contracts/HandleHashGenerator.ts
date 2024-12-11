export abstract class HandleHashGenerator {
  abstract handleHash(): Promise<string>
}