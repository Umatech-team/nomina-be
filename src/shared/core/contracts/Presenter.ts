export abstract class Presenter<T, K> {
  abstract toHTTP(props: T): K;
}
